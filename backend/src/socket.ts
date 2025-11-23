import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import prisma from './config/db';

// In-memory cleanup timers
const cleanupTimers = new Map<string, NodeJS.Timeout>();

export const setupSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // --- JOIN ROOM ---
    socket.on('room:join', async (roomId: string, userId: string) => {
      try {
        // 1. Check if room exists and is not ENDED
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room || room.status === 'ENDED') {
          socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found or ended' });
          return;
        }

        // 2. Check Bans
        const ban = await prisma.roomBan.findUnique({
          where: { userId_roomId: { userId, roomId } }
        });
        if (ban) {
          socket.emit('error', { code: 'BANNED_FROM_ROOM', message: 'You are banned from this room' });
          return;
        }

        // 3. Check Capacity
        if (room.participantCount >= room.maxParticipants) {
          // Allow if user is already a participant (re-join)
          const existing = await prisma.roomParticipant.findUnique({
            where: { userId_roomId: { userId, roomId } }
          });
          if (!existing) {
            socket.emit('error', { code: 'ROOM_FULL', message: 'Room is full' });
            return;
          }
        }

        // 4. Join Logic
        socket.join(roomId);

        // Cancel cleanup timer if exists (room is no longer empty)
        if (cleanupTimers.has(roomId)) {
          clearTimeout(cleanupTimers.get(roomId)!);
          cleanupTimers.delete(roomId);
        }

        // Update/Create Participant
        // Check if first participant to determine role if not exists
        const participantCount = await prisma.roomParticipant.count({ where: { roomId } });

        let role = 'MEMBER';
        let status = 'LISTENER';

        // If owner, force role
        if (room.ownerId === userId) {
          role = 'OWNER';
          status = 'SPEAKER';
        } else if (participantCount === 0) {
          // Should not happen if owner is added on create, but fallback
          role = 'OWNER';
          status = 'SPEAKER';
        }

        const participant = await prisma.roomParticipant.upsert({
          where: { userId_roomId: { userId, roomId } },
          update: { lastSeenAt: new Date(), joinedAt: new Date() }, // Update lastSeen
          create: {
            roomId,
            userId,
            role,
            status
          }
        });

        // Update Room Status & Count
        await prisma.room.update({
          where: { id: roomId },
          data: {
            status: 'LIVE', // Ensure LIVE
            participantCount: { increment: 1 }
          }
        });

        // Notify others
        socket.to(roomId).emit('room:user-joined', {
          userId,
          socketId: socket.id,
          role: participant.role,
          status: participant.status
        });

        console.log(`User ${userId} (${socket.id}) joined room ${roomId}`);

        // Send existing users
        const clients = io.sockets.adapter.rooms.get(roomId);
        if (clients) {
          const otherUsers = Array.from(clients).filter(id => id !== socket.id);
          socket.emit('room:existing-users', otherUsers);
        }

      } catch (error) {
        console.error('Join error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // --- LEAVE ROOM ---
    socket.on('room:leave', async (roomId: string, userId: string) => {
      try {
        socket.leave(roomId);

        // Update DB
        await prisma.roomParticipant.deleteMany({
          where: { userId, roomId }
        });

        const room = await prisma.room.update({
          where: { id: roomId },
          data: { participantCount: { decrement: 1 } }
        });

        socket.to(roomId).emit('room:user-left', { userId, socketId: socket.id });
        console.log(`User ${userId} left room ${roomId}`);

        // Check for empty room
        if (room.participantCount <= 0) {
          await prisma.room.update({
            where: { id: roomId },
            data: { lastEmptyAt: new Date() }
          });

          // Schedule cleanup (3 mins)
          const timer = setTimeout(async () => {
            const r = await prisma.room.findUnique({ where: { id: roomId } });
            if (r && r.participantCount <= 0) {
              await prisma.room.delete({ where: { id: roomId } });
              console.log(`Room ${roomId} auto-deleted after 3 mins empty.`);
              cleanupTimers.delete(roomId);
            }
          }, 3 * 60 * 1000);
          cleanupTimers.set(roomId, timer);
        }

      } catch (error) {
        console.error('Leave error:', error);
      }
    });

    // --- MODERATION ---
    socket.on('room:kick', async (roomId: string, targetUserId: string, requesterId: string) => {
      try {
        // Verify permissions
        const requester = await prisma.roomParticipant.findUnique({ where: { userId_roomId: { userId: requesterId, roomId } } });
        const target = await prisma.roomParticipant.findUnique({ where: { userId_roomId: { userId: targetUserId, roomId } } });
        const room = await prisma.room.findUnique({ where: { id: roomId } });

        if (!requester || !target || !room) return;

        // Logic: Owner can kick anyone (except self). Co-Owner can kick Members.
        let canKick = false;
        if (requester.role === 'OWNER' && target.userId !== requesterId) canKick = true;
        if (requester.role === 'CO_OWNER' && target.role === 'MEMBER') canKick = true;

        if (!canKick) {
          socket.emit('error', { code: 'FORBIDDEN', message: 'Insufficient permissions' });
          return;
        }

        // Log action
        await prisma.moderationLog.create({
          data: {
            roomId,
            actorId: requesterId,
            targetId: targetUserId,
            action: 'KICK'
          }
        });

        // Emit kick event (Frontend should handle disconnect/redirect)
        io.to(roomId).emit('room:user-kicked', { userId: targetUserId, kickedBy: requesterId });

        // Force disconnect logic would go here if we tracked socketIds per user reliably
        // For now, rely on client to listen to 'room:user-kicked' and disconnect self.

      } catch (error) {
        console.error('Kick error:', error);
      }
    });

    // --- SPEAKER/LISTENER ---
    socket.on('room:raise-hand', async (roomId: string, userId: string) => {
      await prisma.roomParticipant.update({
        where: { userId_roomId: { userId, roomId } },
        data: { wantsToSpeak: true }
      });
      io.to(roomId).emit('room:hand-raised', { userId });
    });

    socket.on('room:grant-speaker', async (roomId: string, targetUserId: string, requesterId: string) => {
      // Verify requester is OWNER/CO_OWNER
      const requester = await prisma.roomParticipant.findUnique({ where: { userId_roomId: { userId: requesterId, roomId } } });
      if (!requester || (requester.role !== 'OWNER' && requester.role !== 'CO_OWNER')) return;

      await prisma.roomParticipant.update({
        where: { userId_roomId: { userId: targetUserId, roomId } },
        data: { status: 'SPEAKER', wantsToSpeak: false }
      });
      io.to(roomId).emit('room:role-updated', { userId: targetUserId, status: 'SPEAKER' });
    });

    socket.on('room:revoke-speaker', async (roomId: string, targetUserId: string, requesterId: string) => {
      // Verify requester is OWNER/CO_OWNER
      const requester = await prisma.roomParticipant.findUnique({ where: { userId_roomId: { userId: requesterId, roomId } } });
      if (!requester || (requester.role !== 'OWNER' && requester.role !== 'CO_OWNER')) return;

      await prisma.roomParticipant.update({
        where: { userId_roomId: { userId: targetUserId, roomId } },
        data: { status: 'LISTENER' }
      });
      io.to(roomId).emit('room:role-updated', { userId: targetUserId, status: 'LISTENER' });
    });

    // --- CHAT & WebRTC (Existing) ---
    // Rate Limiting Map
    const rateLimits = new Map<string, { count: number, lastReset: number }>();

    socket.on('chat:message', (roomId: string, message: any) => {
      const now = Date.now();
      const limit = rateLimits.get(socket.id) || { count: 0, lastReset: now };

      if (now - limit.lastReset > 10000) {
        limit.count = 0;
        limit.lastReset = now;
      }

      if (limit.count >= 5) {
        socket.emit('error', { message: 'Rate limit exceeded. Please wait.' });
        return;
      }

      limit.count++;
      rateLimits.set(socket.id, limit);

      if (typeof message.content === 'string') {
        message.content = message.content
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      io.to(roomId).emit('chat:message', message);
    });

    socket.on('webrtc:offer', (data: { targetSocketId: string, sdp: any }) => {
      io.to(data.targetSocketId).emit('webrtc:offer', {
        sdp: data.sdp,
        senderSocketId: socket.id
      });
    });

    socket.on('webrtc:answer', (data: { targetSocketId: string, sdp: any }) => {
      io.to(data.targetSocketId).emit('webrtc:answer', {
        sdp: data.sdp,
        senderSocketId: socket.id
      });
    });

    socket.on('webrtc:ice-candidate', (data: { targetSocketId: string, candidate: any }) => {
      io.to(data.targetSocketId).emit('webrtc:ice-candidate', {
        candidate: data.candidate,
        senderSocketId: socket.id
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Ideally we should handle unexpected disconnects to update DB presence
      // But since we don't have a reliable socketId -> userId map in memory here (without looking it up),
      // we rely on the client sending 'room:leave' or the presence ping system (to be implemented).
    });
  });

  return io;
};
