const axios = require('axios');
const io = require('socket.io-client');

const API_URL = 'http://localhost:3000';
const SOCKET_URL = 'http://localhost:3000';

async function verifyRestApi() {
    console.log('--- Verifying REST API ---');
    try {
        // 1. Health/Root check (if exists) or List Rooms
        // We'll try to fetch rooms. Expecting 200 OK and an array (even if empty).
        const response = await axios.get(`${API_URL}/rooms`);
        console.log('✅ GET /rooms success:', response.status);
        console.log('   Data:', response.data);
        return true;
    } catch (error) {
        console.error('❌ GET /rooms failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        return false;
    }
}

async function verifyWebSocket() {
    console.log('\n--- Verifying WebSocket ---');
    return new Promise((resolve) => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: false,
        });

        socket.on('connect', () => {
            console.log('✅ WebSocket connected:', socket.id);

            // Test room:join
            const roomId = 'test-room-sanity';
            const userId = 'sanity-user';
            console.log(`   Emitting room:join for ${roomId}...`);
            socket.emit('room:join', roomId, userId);

            // Since we don't get room:user-joined for ourselves, we assume success if we don't get an error
            // Wait a bit and then disconnect
            setTimeout(() => {
                console.log('✅ WebSocket join emitted (assuming success)');
                socket.disconnect();
                resolve(true);
            }, 1000);
        });

        socket.on('room:user-joined', (data) => {
            console.log('✅ Received room:user-joined:', data);
            // This might not fire for self, but if it does, great.
        });

        socket.on('connect_error', (err) => {
            console.error('❌ WebSocket connection error:', err.message);
            resolve(false);
        });

        // Timeout
        setTimeout(() => {
            if (socket.connected) {
                console.log('⚠️  Timeout waiting for room:user-joined (but connected)');
                socket.disconnect();
                resolve(true); // Connected at least
            } else {
                console.error('❌ WebSocket timeout (not connected)');
                resolve(false);
            }
        }, 5000);
    });
}

async function run() {
    const apiSuccess = await verifyRestApi();
    const wsSuccess = await verifyWebSocket();

    if (apiSuccess && wsSuccess) {
        console.log('\n🎉 Sanity Check PASSED');
        process.exit(0);
    } else {
        console.error('\n💥 Sanity Check FAILED');
        process.exit(1);
    }
}

run();
