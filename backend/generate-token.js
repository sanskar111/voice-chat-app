const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate token for a mock user
// In production, the user ID would come from the database
const mockUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@talksick.com',
    username: 'TestUser'
};

const token = jwt.sign(
    { userId: mockUser.id, email: mockUser.email, username: mockUser.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

console.log('\n=== Generated JWT Token ===');
console.log(token);
console.log('\n=== User Info ===');
console.log(JSON.stringify(mockUser, null, 2));
console.log('\n=== Usage ===');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/rooms`);
