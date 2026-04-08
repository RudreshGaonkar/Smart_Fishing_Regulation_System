import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRegistration } from '../middleware/validateMiddleware';

const router = Router();

router.post('/register', validateRegistration, AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

export default router;
