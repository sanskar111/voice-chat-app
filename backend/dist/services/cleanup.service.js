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
exports.startCleanupJob = void 0;
const db_1 = __importDefault(require("../config/db"));
const startCleanupJob = () => {
    // Run every 2 minutes
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
            // Find rooms that are empty and lastEmptyAt is older than 3 mins
            const roomsToDelete = yield db_1.default.room.findMany({
                where: {
                    participantCount: 0,
                    lastEmptyAt: {
                        lte: threeMinutesAgo
                    }
                }
            });
            if (roomsToDelete.length > 0) {
                console.log(`Found ${roomsToDelete.length} empty rooms to clean up.`);
                for (const room of roomsToDelete) {
                    yield db_1.default.room.delete({ where: { id: room.id } });
                    console.log(`Deleted room ${room.id}`);
                }
            }
        }
        catch (error) {
            console.error('Error in cleanup job:', error);
        }
    }), 2 * 60 * 1000);
};
exports.startCleanupJob = startCleanupJob;
