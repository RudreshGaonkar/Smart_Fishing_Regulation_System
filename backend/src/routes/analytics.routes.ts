import { Router } from 'express';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware';
import { getPopulationTrends, getCatchHistory } from '../controllers/analyticsController';

const router = Router();

// Accessible to admins and researchers
router.get('/population', verifyToken, authorizeRole('admin', 'researcher'), getPopulationTrends);
router.get('/catches',    verifyToken, authorizeRole('admin', 'researcher'), getCatchHistory);

export default router;
