import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { startSession, getMyActiveSession } from '../controllers/sessionController';
import { recordCatch } from '../controllers/catchController';

const router = Router();

// Get the current user's active session (must be before /:id routes)
router.get('/me/active', verifyToken, getMyActiveSession);

// Start a new session
router.post('/', verifyToken, startSession);

// Record a catch in a specific session
router.post('/:id/catch', verifyToken, recordCatch);

export default router;
