import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/db';

describe('Room Endpoints', () => {
    let userId: string;

    beforeAll(async () => {
        await prisma.room.deleteMany();
        await prisma.user.deleteMany();

        const user = await prisma.user.create({
            data: {
                username: 'host',
                email: 'host@example.com',
                password: 'hashedpassword'
            }
        });
        userId = user.id;
    });

    it('should create a room', async () => {
        const res = await request(app)
            .post('/rooms')
            .send({
                name: 'Test Room',
                topic: 'Testing',
                language: 'English',
                hostId: userId
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual('Test Room');
    });

    it('should list rooms', async () => {
        const res = await request(app).get('/rooms');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });
});
