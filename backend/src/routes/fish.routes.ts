import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { getAllSpecies } from '../controllers/fishController';

const router = Router();

// Retrieve all fish species, accessible to all authenticated users
router.get('/', verifyToken, getAllSpecies);

export default router;
