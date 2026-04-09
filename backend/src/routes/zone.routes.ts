import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { getAllZones, getSafeAlternatives } from '../controllers/zoneController';

const router = Router();

// Get all zones
router.get('/', verifyToken, getAllZones);

// Get safe alternatives for a particular zone
router.get('/:id/alternatives', verifyToken, getSafeAlternatives);

export default router;
