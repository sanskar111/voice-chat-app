import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 }, // Ramp up to 50 users
        { duration: '1m', target: 50 },  // Stay at 50 users
        { duration: '10s', target: 0 },  // Ramp down
    ],
};

export default function () {
    const url = 'ws://localhost:3000/socket.io/?EIO=4&transport=websocket';
    const params = { tags: { my_tag: 'hello' } };

    const res = ws.connect(url, params, function (socket) {
        socket.on('open', function open() {
            // Simulate Socket.io handshake
            socket.send('40');

            socket.setInterval(function timeout() {
                socket.send('42["chat:message", "test-room", {"content": "Hello k6", "sender": "k6-user"}]');
            }, 1000);
        });

        socket.on('message', function (message) {
            const msg = JSON.parse(message);
            if (msg.startsWith('42')) {
                check(message, { 'Received message': (m) => m.length > 0 });
            }
        });

        socket.on('close', () => console.log('disconnected'));
    });

    check(res, { 'status is 101': (r) => r && r.status === 101 });
}
