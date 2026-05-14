import { createClient } from "redis";
import type { RedisClientType } from "redis";

import logger from "@/utils/logger.js";

let redisClient: RedisClientType | null = null;

interface RedisConfig {
  username?: string;
  password?: string;
  host: string;
  port: number;
}

/**
 * Initialize Redis Connection
 */
export const connectRedis = async (redis: RedisConfig): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    ...(redis.username && { username: redis.username }),
    ...(redis.password && { password: redis.password }),

    socket: {
      host: redis.host,
      port: redis.port,

      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error("Redis reconnection failed after 10 attempts");

          return new Error("Redis reconnection failed");
        }

        return Math.min(retries * 100, 3000);
      },
    },
  });

  /**
   * Events
   */
  redisClient.on("connect", () => {
    logger.info("Redis client connecting...");
  });

  redisClient.on("ready", () => {
    logger.info("Redis connected and ready");
  });

  redisClient.on("error", (err) => {
    logger.error({ err }, "Redis Client Error");
  });

  redisClient.on("end", () => {
    logger.warn("Redis connection closed");
  });

  redisClient.on("reconnecting", () => {
    logger.info("Redis reconnecting...");
  });

  try {
    await redisClient.connect();
  } catch (err) {
    logger.error({ err }, "Initial Redis connection failed");

    redisClient = null;

    throw err;
  }

  return redisClient;
};

/**
 * Safe getter
 */
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }

  return redisClient;
};
