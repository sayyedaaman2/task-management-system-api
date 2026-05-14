import app from "./app.js";

import serverConfig from "@/config/env.js";
import connectDB from "@/lib/mongodb.js";
import { connectRedis } from "@/lib/redis.js";
import logger from "@/utils/logger.js";

async function startServer() {
  try {
    await Promise.all([connectDB(serverConfig.mongodbUri), connectRedis(serverConfig.redis)]);
    app.listen(serverConfig.port, () => {
      logger.info(
        `Server is running on port ${serverConfig.port} in ${serverConfig.nodeEnv} mode.`
      );
    });
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Error starting server: ${err.message}`);
    } else {
      logger.error("Unknown error starting server");
    }

    throw err;
  }
}
void startServer();
