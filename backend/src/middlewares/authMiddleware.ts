// ============================================
// AUTH MIDDLEWARE
// Validates JWT tokens and protects routes
// ============================================

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/Auth';
import { AuthRequest } from '../types';
import { UnauthorizedError } from '../utils/CustomErrors';

const authService = new AuthService();

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const payload = authService.verifyToken(token);

        // Attach user to request
        (req as AuthRequest).user = payload;

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to verify user is admin
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authReq = req as AuthRequest;
        if (!authReq.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        if (!authReq.user.role) {
            throw new UnauthorizedError('Admin access required');
        }

        next();
    } catch (error) {
        next(error);
    }
};