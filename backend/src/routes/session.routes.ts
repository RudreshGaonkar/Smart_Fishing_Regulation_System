import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { startSession } from '../controllers/sessionController';
import { recordCatch } from '../controllers/catchController';

const router = Router();

// Start a session
router.post('/', verifyToken, startSession);

// Record a catch in a specific session
router.post('/:id/catch', verifyToken, recordCatch);

export default router;
