import type { Request, Response } from "express";
import mongoose from "mongoose";

import { getRedisClient } from "@/lib/redis.js";

const healthCheck = async (
  _req: Request,
  res: Response
) => {
  try {
    /**
     * MongoDB Status
     */
    const mongoState = mongoose.connection.readyState;

    const mongoConnected = mongoState === 1;

    /**
     * Redis Status
     */
    let redisConnected = false;

    try {
      const redis = getRedisClient();

      await redis.ping();

      redisConnected = true;
    } catch {
      redisConnected = false;
    }

    /**
     * System Health
     */
    const health = {
      success: true,

      timestamp: new Date().toISOString(),

      uptime: process.uptime(),

      environment: process.env.NODE_ENV,

      services: {
        mongodb: mongoConnected
          ? "connected"
          : "disconnected",

        redis: redisConnected
          ? "connected"
          : "disconnected",
      },

      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
      },
    };

    /**
     * Determine overall status
     */
    const isHealthy =
      mongoConnected && redisConnected;

    return res
      .status(isHealthy ? 200 : 503)
      .json(health);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Health check failed",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

export default healthCheck