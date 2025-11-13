import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/CacheService';

/**
 * Cache Middleware - Caches GET request responses
 */
export const cacheMiddleware = (ttl: number = 3600) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Skip if Redis is not connected
        if (!cacheService.isReady()) {
            return next();
        }

        try {
            // Generate cache key from URL and query params
            const cacheKey = `route:${req.originalUrl}`;

            // Try to get from cache
            const cachedData = await cacheService.get(cacheKey);

            if (cachedData) {
                console.log(`✅ Cache HIT: ${req.originalUrl}`);
                return res.json(cachedData);
            }

            console.log(`❌ Cache MISS: ${req.originalUrl}`);

            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json method to cache response
            res.json = function(data: any) {
                // Cache the response
                cacheService.set(cacheKey, data, ttl)
                    .catch(err => console.error('Failed to cache response:', err));

                // Call original json method
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

/**
 * Cache invalidation middleware - Clears cache for specific patterns
 */
export const invalidateCache = (pattern: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await cacheService.delPattern(pattern);
            console.log(`🗑️  Cache invalidated: ${pattern}`);
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
        next();
    };
};
