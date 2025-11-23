const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL + "&connection_limit=1"
        }
    }
});

async function setup() {
    try {
        console.log('Creating test user...');
        const user = await prisma.user.upsert({
            where: { email: 'curl_test@example.com' },
            update: {},
            create: {
                email: 'curl_test@example.com',
                username: 'CurlUser',
                googleId: 'curl-google-id',
                avatar: 'https://via.placeholder.com/150'
            }
        });

        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('TOKEN:', token);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

setup();
