import { Request, Response } from 'express';
import prisma from '../config/db';

export const getRooms = async (req: Request, res: Response) => {
    try {
        // Return only LIVE and PUBLIC/LOCKED rooms
        const rooms = await prisma.room.findMany({
            where: {
                status: 'LIVE',
                visibility: { in: ['PUBLIC', 'LOCKED'] }
            },
            include: {
                _count: { select: { participants: true } },
                owner: { select: { id: true, username: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rooms || []);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Error fetching rooms' });
    }
};

export const createRoom = async (req: Request, res: Response) => {
    try {
        const { title, topic, language, visibility, scheduledAt } = req.body;
        const ownerId = (req.user as any)?.id;

        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized: No user found' });
        }

        // Default status logic
        // If no schedule, default to LIVE so it shows up immediately
        let status = 'LIVE';
        if (scheduledAt && new Date(scheduledAt) > new Date()) {
            status = 'SCHEDULED';
        }

        // Use transaction to ensure room and participant are created together
        const result = await prisma.$transaction(async (tx) => {
            const room = await tx.room.create({
                data: {
                    title: title || `${(req.user as any).username}'s Room`,
                    topic,
                    language,
                    ownerId,
                    visibility: visibility || 'PUBLIC',
                    status,
                    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                    participantCount: 1 // Owner is first participant
                }
            });

            await tx.roomParticipant.create({
                data: {
                    roomId: room.id,
                    userId: ownerId,
                    role: 'OWNER',
                    status: 'SPEAKER'
                }
            });

            return room;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Error creating room' });
    }
};

export const getRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const room = await prisma.room.findUnique({
            where: { id },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true, avatar: true } } }
                },
                owner: { select: { id: true, username: true, avatar: true } }
            }
        });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Error fetching room' });
    }
};
