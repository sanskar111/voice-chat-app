const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL + "&connection_limit=1"
        }
    },
    log: ['query', 'info', 'warn', 'error'],
});
const API_URL = 'http://localhost:3000';

async function testRoomFlow() {
    try {
        console.log('1. Creating test user...');
        const user = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: {},
            create: {
                email: 'test@example.com',
                username: 'TestUser',
                googleId: 'test-google-id',
                avatar: 'https://via.placeholder.com/150'
            }
        });
        console.log('User created:', user.id);

        console.log('2. Generating JWT token...');
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log('Token generated.');

        console.log('3. Testing POST /rooms (Create Room)...');
        const createRes = await axios.post(`${API_URL}/rooms`, {
            title: 'Integration Test Room',
            topic: 'Testing Flow',
            visibility: 'PUBLIC'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Room created:', createRes.data.id, createRes.data.status);

        if (createRes.data.status !== 'LIVE') {
            throw new Error(`Expected status LIVE, got ${createRes.data.status}`);
        }

        console.log('4. Testing GET /rooms (List Rooms)...');
        const listRes = await axios.get(`${API_URL}/rooms`);
        console.log('Rooms found:', listRes.data.length);

        const found = listRes.data.find(r => r.id === createRes.data.id);
        if (!found) {
            throw new Error('Created room not found in list!');
        }
        console.log('Created room verified in list.');

        console.log('5. Cleaning up...');
        await prisma.room.delete({ where: { id: createRes.data.id } });
        console.log('Cleanup done.');

        console.log('✅ TEST PASSED');
    } catch (error) {
        console.error('❌ TEST FAILED:', error.response?.data || error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testRoomFlow();
