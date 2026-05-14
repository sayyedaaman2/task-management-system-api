import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

import logger from '@/utils/logger.js';

/**
 * Singleton instance of the Redis client
 */
let redisClient: RedisClientType;

/**
 * Initialize and connect to Redis
 */

interface RedisConfig {
    username : string,
    password : string,
    host : string,
    port : number
}
const connectRedis = async (redis:RedisConfig): Promise<RedisClientType> => {
    if (!redisClient) {
        redisClient = createClient({
            username : redis.username,
            password : redis.password,
            socket: {
                host : redis.host,
                port : redis.port,
                reconnectStrategy: (retries) => {
                    // Exponential backoff or simple retry
                    if (retries > 10) {
                        logger.error('Redis reconnection failed after 10 attempts');
                        return new Error('Redis reconnection failed');
                    }
                    return Math.min(retries * 50, 2000);
                }
            }
        });

        // Event Listeners
        redisClient.on('connect', () => logger.info('Redis client connecting...'));
        redisClient.on('ready', () => logger.info('Redis connected and ready to use'));
        redisClient.on('error', (err) => logger.error({ err }, 'Redis Client Error'));
        redisClient.on('end', () => logger.warn('Redis connection closed'));
        redisClient.on('reconnecting', () => logger.info('Redis client reconnecting...'));

        try {
            await redisClient.connect();
        } catch (err) {
            logger.error({ err }, 'Initial Redis connection error');
            throw err;
        }
    }

    return redisClient;
};

/**
 * Export the connection function and the client getter
 */
export { connectRedis, redisClient };
