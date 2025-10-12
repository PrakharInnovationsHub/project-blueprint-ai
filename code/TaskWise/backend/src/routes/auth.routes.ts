import { Router } from 'express';
import { register, login, getMe, registerValidation, loginValidation } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', registerValidation, register);

// POST /api/auth/login - Login user
router.post('/login', loginValidation, login);

// GET /api/auth/me - Get current user (protected)
router.get('/me', authenticate, getMe);

export default router;
