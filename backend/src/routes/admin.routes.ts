import { Router } from 'express';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware';
import { createZone, createSpecies, setCatchLimit, updateZone, deleteZone } from '../controllers/adminController';

const router = Router();

// All admin routes require a valid token + admin role
router.get('/zones',         verifyToken, authorizeRole('admin'), (req, res) => res.status(501).json({ error: 'Use global zones endpoint' }));
router.post('/zones',        verifyToken, authorizeRole('admin'), createZone);
router.put('/zones/:id',     verifyToken, authorizeRole('admin'), updateZone);
router.delete('/zones/:id',  verifyToken, authorizeRole('admin'), deleteZone);
router.post('/fish',         verifyToken, authorizeRole('admin'), createSpecies);
router.post('/catch-limits', verifyToken, authorizeRole('admin'), setCatchLimit);


export default router;
