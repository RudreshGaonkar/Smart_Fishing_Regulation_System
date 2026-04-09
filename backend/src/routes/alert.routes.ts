import { Router } from 'express';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware';
import { getAllAlerts, resolveAlert } from '../controllers/alertController';

const router = Router();

// All logged-in users can view alerts
router.get('/', verifyToken, getAllAlerts);

// Only admins can resolve alerts
router.patch('/:id/resolve', verifyToken, authorizeRole('admin'), resolveAlert);

export default router;
