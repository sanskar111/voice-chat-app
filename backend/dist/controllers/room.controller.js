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
        const rooms = yield db_1.default.room.findMany({
            include: { _count: { select: { participants: true } } }
        });
        res.json(rooms);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching rooms' });
    }
});
exports.getRooms = getRooms;
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, topic, language, hostId } = req.body;
        const room = yield db_1.default.room.create({
            data: { name, topic, language, hostId }
        });
        res.status(201).json(room);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating room' });
    }
});
exports.createRoom = createRoom;
const getRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const room = yield db_1.default.room.findUnique({
            where: { id },
            include: { participants: { include: { user: true } } }
        });
        if (!room)
            return res.status(404).json({ error: 'Room not found' });
        res.json(room);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching room' });
    }
});
exports.getRoom = getRoom;
