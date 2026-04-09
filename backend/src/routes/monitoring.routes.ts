// ============================================================
// Monitoring Routes — backend/src/routes/monitoring.routes.ts
// ============================================================
import { Router } from 'express';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware';
import { getActiveSessions } from '../controllers/monitoringController';

const router = Router();

// GET /api/admin/monitoring/active — Admin only
router.get('/active', verifyToken, authorizeRole('admin'), getActiveSessions);

export default router;
