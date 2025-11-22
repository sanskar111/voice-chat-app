import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/db';

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        await prisma.user.deleteMany();
    });

    it('should signup a new user', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('userId');
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
