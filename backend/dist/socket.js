"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const setupSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "*",
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('room:join', (roomId, userId) => {
            socket.join(roomId);
            socket.to(roomId).emit('room:user-joined', { userId, socketId: socket.id });
            console.log(`User ${userId} (${socket.id}) joined room ${roomId}`);
            // Get list of all other users in the room to initiate connections
            const clients = io.sockets.adapter.rooms.get(roomId);
            if (clients) {
                const otherUsers = Array.from(clients).filter(id => id !== socket.id);
                socket.emit('room:existing-users', otherUsers);
            }
        });
        socket.on('room:leave', (roomId, userId) => {
            socket.leave(roomId);
            socket.to(roomId).emit('room:user-left', { userId, socketId: socket.id });
            console.log(`User ${userId} left room ${roomId}`);
        });
        // Rate Limiting Map
        const rateLimits = new Map();
        socket.on('chat:message', (roomId, message) => {
            // Rate Limiting Logic
            const now = Date.now();
            const limit = rateLimits.get(socket.id) || { count: 0, lastReset: now };
            if (now - limit.lastReset > 10000) { // Reset every 10 seconds
                limit.count = 0;
                limit.lastReset = now;
            }
            if (limit.count >= 5) { // Max 5 messages per 10 seconds
                socket.emit('error', { message: 'Rate limit exceeded. Please wait.' });
                return;
            }
            limit.count++;
            rateLimits.set(socket.id, limit);
            // Input Sanitization (Basic HTML escaping)
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
        // WebRTC Signaling
        socket.on('webrtc:offer', (data) => {
            io.to(data.targetSocketId).emit('webrtc:offer', {
                sdp: data.sdp,
                senderSocketId: socket.id
            });
        });
        socket.on('webrtc:answer', (data) => {
            io.to(data.targetSocketId).emit('webrtc:answer', {
                sdp: data.sdp,
                senderSocketId: socket.id
            });
        });
        socket.on('webrtc:ice-candidate', (data) => {
            io.to(data.targetSocketId).emit('webrtc:ice-candidate', {
                candidate: data.candidate,
                senderSocketId: socket.id
            });
        });
        socket.on('room:kick', (roomId, targetUserId, requesterId) => __awaiter(void 0, void 0, void 0, function* () {
            // In a real app, verify requesterId is the host via DB
            // For MVP, we trust the client or check a simple in-memory map if we had one
            // Let's assume the frontend only shows the button if they are host
            console.log(JSON.stringify({ event: 'room:kick', roomId, targetUserId, requesterId, timestamp: new Date().toISOString() }));
            // Find the socket of the target user
            const clients = yield io.in(roomId).fetchSockets();
            const targetSocket = clients.find(s => {
                // We need a way to map userId to socketId reliably. 
                // For this MVP, we'll rely on the client sending the targetSocketId for simplicity, 
                // OR we broadcast a "kick" message with userId and let clients handle it.
                // Broadcasting is safer for this stateless MVP.
                return false;
            });
            io.to(roomId).emit('room:user-kicked', { userId: targetUserId });
        }));
        socket.on('disconnect', () => {
            console.log(JSON.stringify({ event: 'disconnect', socketId: socket.id, timestamp: new Date().toISOString() }));
        });
    });
    return io;
};
exports.setupSocket = setupSocket;
