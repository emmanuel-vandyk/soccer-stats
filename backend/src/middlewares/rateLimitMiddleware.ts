// ============================================
// RATE LIMITING MIDDLEWARE
// Prevents brute force attacks on authentication endpoints
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

interface RateLimitStore {
    [key: string]: {
        count: number;
        firstAttempt: number;
        blockUntil?: number;
    };
}

const store: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        const entry = store[key];
        // Remove entries older than 1 hour
        if (now - entry.firstAttempt > 60 * 60 * 1000) {
            delete store[key];
        }
    });
}, 10 * 60 * 1000);

/**
 * Rate limiting middleware
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @param blockDurationMs - Block duration after max attempts
 */
export const rateLimitMiddleware = (
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    blockDurationMs: number = 15 * 60 * 1000 // 15 minutes block
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Get identifier (IP address or user identifier)
        const identifier = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();

        // Initialize or get existing entry
        if (!store[identifier]) {
            store[identifier] = {
                count: 1,
                firstAttempt: now
            };
            return next();
        }

        const entry = store[identifier];

        // Check if currently blocked
        if (entry.blockUntil && now < entry.blockUntil) {
            const remainingSeconds = Math.ceil((entry.blockUntil - now) / 1000);
            return ApiResponse.error(
                res,
                'TOO_MANY_REQUESTS',
                `Too many attempts. Please try again in ${remainingSeconds} seconds.`,
                429
            );
        }

        // Reset if window has passed
        if (now - entry.firstAttempt > windowMs) {
            store[identifier] = {
                count: 1,
                firstAttempt: now
            };
            return next();
        }

        // Increment attempt count
        entry.count++;

        // Check if exceeded max attempts
        if (entry.count > maxAttempts) {
            entry.blockUntil = now + blockDurationMs;
            const blockMinutes = Math.ceil(blockDurationMs / 60000);
            
            console.warn(`🚨 Rate limit exceeded for IP: ${identifier} - Blocked for ${blockMinutes} minutes`);
            
            return ApiResponse.error(
                res,
                'TOO_MANY_REQUESTS',
                `Too many login attempts. Account temporarily locked for ${blockMinutes} minutes.`,
                429
            );
        }

        // Add remaining attempts header
        const remainingAttempts = maxAttempts - entry.count;
        res.setHeader('X-RateLimit-Remaining', remainingAttempts.toString());
        res.setHeader('X-RateLimit-Limit', maxAttempts.toString());

        next();
    };
};

/**
 * Strict rate limiting for sensitive endpoints (login, register)
 * 5 attempts per 15 minutes
 */
export const strictRateLimit = rateLimitMiddleware(
    5,                      // 5 attempts
    15 * 60 * 1000,        // 15 minutes window
    15 * 60 * 1000         // 15 minutes block
);

/**
 * Moderate rate limiting for general authenticated endpoints
 * 100 requests per minute
 */
export const moderateRateLimit = rateLimitMiddleware(
    100,                    // 100 attempts
    60 * 1000,             // 1 minute window
    5 * 60 * 1000          // 5 minutes block
);

/**
 * Lenient rate limiting for public endpoints
 * 1000 requests per hour
 */
export const lenientRateLimit = rateLimitMiddleware(
    1000,                   // 1000 attempts
    60 * 60 * 1000,        // 1 hour window
    10 * 60 * 1000         // 10 minutes block
);
