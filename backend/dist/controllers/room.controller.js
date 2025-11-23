"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoom = exports.createRoom = exports.getRooms = void 0;
const db_1 = __importDefault(require("../config/db"));
const getRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Return only LIVE and PUBLIC/LOCKED rooms
        const rooms = yield db_1.default.room.findMany({
            where: {
                status: 'LIVE',
                visibility: { in: ['PUBLIC', 'LOCKED'] }
            },
            include: {
                _count: { select: { participants: true } },
                owner: { select: { id: true, username: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rooms || []);
    }
    catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Error fetching rooms' });
    }
});
exports.getRooms = getRooms;
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, topic, language, visibility, scheduledAt } = req.body;
        const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!ownerId) {
            return res.status(401).json({ error: 'Unauthorized: No user found' });
        }
        // Default status logic
        // If no schedule, default to LIVE so it shows up immediately
        let status = 'LIVE';
        if (scheduledAt && new Date(scheduledAt) > new Date()) {
            status = 'SCHEDULED';
        }
        // Use transaction to ensure room and participant are created together
        const result = yield db_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const room = yield tx.room.create({
                data: {
                    title: title || `${req.user.username}'s Room`,
                    topic,
                    language,
                    ownerId,
                    visibility: visibility || 'PUBLIC',
                    status,
                    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                    participantCount: 1 // Owner is first participant
                }
            });
            yield tx.roomParticipant.create({
                data: {
                    roomId: room.id,
                    userId: ownerId,
                    role: 'OWNER',
                    status: 'SPEAKER'
                }
            });
            return room;
        }));
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Error creating room' });
    }
});
exports.createRoom = createRoom;
const getRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const room = yield db_1.default.room.findUnique({
            where: { id },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true, avatar: true } } }
                },
                owner: { select: { id: true, username: true, avatar: true } }
            }
        });
        if (!room)
            return res.status(404).json({ error: 'Room not found' });
        res.json(room);
    }
    catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Error fetching room' });
    }
});
exports.getRoom = getRoom;
