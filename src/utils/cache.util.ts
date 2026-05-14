import logger from "./logger.js";

import { getRedisClient } from "@/lib/redis.js";

type CacheResource = "tasks" | "users" | "analytics";

/**
 * Clear multiple cache resources
 */
export const clearCache = async (resources: CacheResource[], userId?: string) => {
  try {
    const redis = getRedisClient();

    for (const resource of resources) {
      const pattern = userId ? `cache:${userId}:*${resource}*` : `cache:*${resource}*`;

      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(keys);

        logger.info(`Cleared ${keys.length} ${resource} cache keys`);
      }
    }
  } catch (error) {
    logger.error({ error }, "Redis Clear Cache Error:");
  }
};
