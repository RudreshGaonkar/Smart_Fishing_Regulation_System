// ============================================================
// Port Routes — backend/src/routes/port.routes.ts
// ============================================================
import { Router } from 'express';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware';
import { getAllPorts } from '../controllers/portController';

const router = Router();

// GET /api/admin/ports — Admin only
router.get('/', verifyToken, authorizeRole('admin'), getAllPorts);

export default router;
