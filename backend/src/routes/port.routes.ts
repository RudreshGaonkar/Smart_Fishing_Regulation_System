import { Router } from 'express';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware';
import { getAllPorts, createPort, updatePort, deletePort } from '../controllers/portController';

const router = Router();

// GET /api/admin/ports — Available to all authenticated users (Fishermen need this for dropdown)
router.get('/', verifyToken, getAllPorts);

// Write operations remain strictly Admin-only
router.post('/', verifyToken, authorizeRole('admin'), createPort);
router.put('/:id', verifyToken, authorizeRole('admin'), updatePort);
router.delete('/:id', verifyToken, authorizeRole('admin'), deletePort);

export default router;
