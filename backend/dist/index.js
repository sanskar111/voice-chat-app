"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./socket");
const dotenv_1 = __importDefault(require("dotenv"));
const cleanup_service_1 = require("./services/cleanup.service");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const server = http_1.default.createServer(app_1.default);
(0, socket_1.setupSocket)(server);
// Start background jobs
(0, cleanup_service_1.startCleanupJob)();
server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
