import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { getAllZones, getSafeAlternatives, getRecommendation } from '../controllers/zoneController';

const router = Router();

// Get all zones
router.get('/', verifyToken, getAllZones);

// Get safe alternatives for a particular zone
router.get('/:id/alternatives', verifyToken, getSafeAlternatives);

// Get intelligent recommendation (nearest safe zone + lockout reason)
router.get('/:id/recommendation', verifyToken, getRecommendation);

export default router;
