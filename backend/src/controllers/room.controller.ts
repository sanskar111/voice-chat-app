import { Request, Response } from 'express';
import prisma from '../config/db';

export const getRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany({
            include: { _count: { select: { participants: true } } }
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching rooms' });
    }
};

export const createRoom = async (req: Request, res: Response) => {
    try {
        const { name, topic, language, hostId } = req.body;
        const room = await prisma.room.create({
            data: { name, topic, language, hostId }
        });
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: 'Error creating room' });
    }
};

export const getRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const room = await prisma.room.findUnique({
            where: { id },
            include: { participants: { include: { user: true } } }
        });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching room' });
    }
};
