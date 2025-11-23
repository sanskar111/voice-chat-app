import http from 'http';
import app from './app';
import { setupSocket } from './socket';
import dotenv from 'dotenv';
import { startCleanupJob } from './services/cleanup.service';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
setupSocket(server);

// Start background jobs
startCleanupJob();

server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
