import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';
const ROOM_ID = 'test-room';

const createClient = (name: string) => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log(`${name} connected: ${socket.id}`);
        socket.emit('room:join', ROOM_ID, name);
    });

    socket.on('room:user-joined', ({ userId }) => {
        console.log(`[${name}] User joined: ${userId}`);
    });

    socket.on('room:existing-users', (users) => {
        console.log(`[${name}] Existing users: ${users}`);
        // Simulate sending offer to existing users
        users.forEach((targetId: string) => {
            console.log(`[${name}] Sending offer to ${targetId}`);
            socket.emit('webrtc:offer', { targetSocketId: targetId, sdp: { type: 'offer', sdp: 'mock-sdp' } });
        });
    });

    socket.on('webrtc:offer', ({ senderSocketId }) => {
        console.log(`[${name}] Received offer from ${senderSocketId}`);
        console.log(`[${name}] Sending answer to ${senderSocketId}`);
        socket.emit('webrtc:answer', { targetSocketId: senderSocketId, sdp: { type: 'answer', sdp: 'mock-sdp' } });
    });

    socket.on('webrtc:answer', ({ senderSocketId }) => {
        console.log(`[${name}] Received answer from ${senderSocketId}`);
    });

    return socket;
};

// Simulate 3 users joining sequentially
const client1 = createClient('User1');

setTimeout(() => {
    const client2 = createClient('User2');
}, 1000);

setTimeout(() => {
    const client3 = createClient('User3');
}, 2000);

// Keep alive for a bit then exit
setTimeout(() => {
    console.log('Simulation finished');
    process.exit(0);
}, 5000);
