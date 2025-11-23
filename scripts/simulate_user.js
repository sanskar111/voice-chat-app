const io = require('../frontend/node_modules/socket.io-client');

const BACKEND_URL = 'https://voice-chat-backend-758892876672.asia-south1.run.app';
const ROOM_ID = process.argv[2] || 'test-room';

console.log(`Connecting to ${BACKEND_URL}...`);
const socket = io(BACKEND_URL, {
    transports: ['websocket'],
    reconnection: false
});

socket.on('connect', () => {
    console.log('Connected via WebSocket:', socket.id);

    // Join room
    console.log(`Joining room: ${ROOM_ID}`);
    // Emitting room:join with roomId and a fake userId
    socket.emit('room:join', ROOM_ID, 'user-b-simulated');
});

socket.on('room:user-joined', (data) => {
    console.log('User joined:', data);
    // Send a welcome message if it's not us (though we get our own join event usually? No, usually broadcast to others)
    // But if we see someone else, say hello
    if (data.userId !== 'user-b-simulated') {
        setTimeout(() => {
            console.log('Sending chat message...');
            socket.emit('chat:message', ROOM_ID, {
                sender: 'User B (Script)',
                content: 'Hello! I see you joined.'
            });
        }, 2000);
    }
});

socket.on('chat:message', (data) => {
    console.log('Received chat message:', data);
    // Reply if it's from someone else
    if (data.sender !== 'User B (Script)') {
        console.log('Replying to message...');
        setTimeout(() => {
            socket.emit('chat:message', ROOM_ID, {
                sender: 'User B (Script)',
                content: `I received your message: "${data.content}"`
            });
        }, 1000);
    }
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
});

// Keep alive for 60 seconds then exit
setTimeout(() => {
    console.log('Simulation ending...');
    socket.disconnect();
    process.exit(0);
}, 60000);
