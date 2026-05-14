import type { Request, Response, NextFunction } from "express";

import serverConfig from "@/config/env.js";
import { getRedisClient } from "@/lib/redis.js";
import logger from "@/utils/logger.js";

/**
 * Generate stable cache key
 */
const generateCacheKey = (req: Request) => {
  const userId = req.user?.userId || "guest";

  const sortedQuery = Object.keys(req.query)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = req.query[key];
        return acc;
      },
      {} as Record<string, unknown>
    );

  return `cache:${userId}:${req.baseUrl}${req.path}:${JSON.stringify(
    req.params
  )}:${JSON.stringify(sortedQuery)}`;
};

/**
 * Cache Middleware
 */
export const cacheMiddleware =
  (ttl?: number) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = generateCacheKey(req);

      const cachedData = await getRedisClient().get(key);
      if (cachedData) {
        logger.info(`CACHE HIT: ${key}`);

        return res.status(200).json(JSON.parse(cachedData));
      }

      logger.info(`CACHE MISS: ${key}  ` );

      const originalJson = res.json.bind(res);

      res.json = ((body: unknown) => {
        try {
          void getRedisClient().setEx(key, ttl ?? Number(serverConfig.redis.ttl), JSON.stringify(body));
        } catch (error) {
          console.error("Redis Set Error:", error);
        }

        return originalJson(body);
      }) as Response["json"];

      next();
    } catch (error) {
      console.error("Redis Cache Error:", error);

      next();
    }
  };
