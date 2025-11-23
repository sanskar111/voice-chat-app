import { Router } from 'express';
import { getRooms, createRoom, getRoom } from '../controllers/room.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getRooms);
router.post('/', authenticateJWT, createRoom);
router.get('/:id', getRoom);

export default router;
