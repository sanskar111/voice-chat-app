"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controllers/room.controller");
const router = (0, express_1.Router)();
router.get('/', room_controller_1.getRooms);
router.post('/', room_controller_1.createRoom);
router.get('/:id', room_controller_1.getRoom);
exports.default = router;
