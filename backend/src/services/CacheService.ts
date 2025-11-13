import Redis from 'ioredis';
import { config } from '../config';

/**
 * CacheService - Redis-based caching layer
 * Improves performance by reducing database queries
 */
class CacheService {
    private client: Redis | null = null;
    private isConnected: boolean = false;
    private readonly DEFAULT_TTL = 3600; // 1 hour in seconds
    private readonly prefix = 'soccer_stats:';

    constructor() {
        this.connect();
    }

    /**
     * Connect to Redis
     */
    private async connect(): Promise<void> {
        try {
            this.client = new Redis({
                host: config.redis.host,
                port: config.redis.port,
                password: config.redis.password || undefined,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableOfflineQueue: false,
            });

            this.client.on('connect', () => {
                console.log('✅ Redis connected successfully');
                this.isConnected = true;
            });

            this.client.on('error', (err) => {
                console.error('❌ Redis connection error:', err.message);
                this.isConnected = false;
            });

            this.client.on('close', () => {
                console.log('⚠️  Redis connection closed');
                this.isConnected = false;
            });

        } catch (error) {
            console.error('Failed to initialize Redis:', error);
            this.isConnected = false;
        }
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.isConnected || !this.client) {
            return null;
        }

        try {
            const data = await this.client.get(this.prefix + key);
            if (!data) return null;

            return JSON.parse(data) as T;
        } catch (error) {
            console.error('Cache GET error:', error);
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            const serialized = JSON.stringify(value);
            await this.client.setex(this.prefix + key, ttl, serialized);
            return true;
        } catch (error) {
            console.error('Cache SET error:', error);
            return false;
        }
    }

    /**
     * Delete value from cache
     */
    async del(key: string | string[]): Promise<boolean> {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            const keys = Array.isArray(key) ? key : [key];
            const prefixedKeys = keys.map(k => this.prefix + k);
            await this.client.del(...prefixedKeys);
            return true;
        } catch (error) {
            console.error('Cache DEL error:', error);
            return false;
        }
    }

    /**
     * Delete all keys matching a pattern
     */
    async delPattern(pattern: string): Promise<boolean> {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            const keys = await this.client.keys(this.prefix + pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
            return true;
        } catch (error) {
            console.error('Cache DEL pattern error:', error);
            return false;
        }
    }

    /**
     * Clear all cache
     */
    async flush(): Promise<boolean> {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            await this.client.flushdb();
            return true;
        } catch (error) {
            console.error('Cache FLUSH error:', error);
            return false;
        }
    }

    /**
     * Check if Redis is connected
     */
    isReady(): boolean {
        return this.isConnected;
    }

    /**
     * Generate cache key for queries
     */
    generateKey(prefix: string, params: Record<string, any>): string {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((acc, key) => {
                acc[key] = params[key];
                return acc;
            }, {} as Record<string, any>);

        return `${prefix}:${JSON.stringify(sortedParams)}`;
    }

    /**
     * Cache wrapper for functions
     */
    async wrap<T>(
        key: string,
        fetchFunction: () => Promise<T>,
        ttl: number = this.DEFAULT_TTL
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch from source
        const data = await fetchFunction();

        // Store in cache
        await this.set(key, data, ttl);

        return data;
    }

    /**
     * Close Redis connection
     */
    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
}

// Export singleton instance
export const cacheService = new CacheService();
