require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    const jwt = require('jsonwebtoken');
    try {
        console.log('Connecting to:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));
        await client.connect();
        console.log('Connected successfully!');

        // Insert or get test user
        console.log('Creating test user...');
        const result = await client.query(`
      INSERT INTO "User" (id, email, username, "googleId", avatar, "createdAt")
      VALUES ('a1b2c3d4-0000-0000-0000-000000000001', 'apitest@talksick.com', 'APITestUser', 'api-test-google-id', 'https://via.placeholder.com/150', NOW())
      ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
      RETURNING id, email, username;
    `);

        const user = result.rows[0];
        console.log('User ready:', user);

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('\n=== JWT TOKEN ===');
        console.log(token);
        console.log('\n=== Test Commands ===');
        console.log(`# List rooms:`);
        console.log(`curl http://localhost:3000/rooms\n`);
        console.log(`# Create room:`);
        console.log(`curl -X POST http://localhost:3000/rooms -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"title":"Test Room","topic":"API Test"}'`);

        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}

testConnection();
