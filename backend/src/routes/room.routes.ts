import { Router } from 'express';
import { getRooms, createRoom, getRoom } from '../controllers/room.controller';

const router = Router();

router.get('/', getRooms);
router.post('/', createRoom);
router.get('/:id', getRoom);

export default router;
