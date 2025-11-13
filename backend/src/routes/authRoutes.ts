// ============================================
// AUTH ROUTES
// Authentication endpoints
// ============================================

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { loginValidators, registerValidators } from '../validators/auth';
import { validate } from '../middlewares/validationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { strictRateLimit } from '../middlewares/rateLimitMiddleware';

const router = Router();
const authController = new AuthController();

/**
 * POST /api/auth/login
 * Login user
 * Rate limited: 5 attempts per 15 minutes
 */
router.post('/login', strictRateLimit, loginValidators, validate, authController.login);

/**
 * POST /api/auth/register
 * Register new user
 * Rate limited: 5 attempts per 15 minutes
 */
router.post('/register', strictRateLimit, registerValidators, validate, authController.register);

/**
 * POST /api/auth/logout
 * Logout user (clear auth cookie)
 */
router.post('/logout', authController.logout);

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Protected route
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;