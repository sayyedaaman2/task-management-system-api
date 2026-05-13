import mongoose from "mongoose";

import logger from "@/utils/logger.js";
/**
 * Production-ready MongoDB connection utility.
 * Note: Mongoose 6+ (including 9.x) does not require useNewUrlParser or useUnifiedTopology.
 */
const connectDB = async (uri: string) => {
  if (!uri) {
    logger.error("MONGO_URI is missing in environment variables");
    throw new Error("MONGO_URI is required to connect to MongoDB");
  }

  try {
    mongoose.connection.on("connected", () => logger.info("MongoDB connected successfully"));
    mongoose.connection.on("error", (err) => logger.error(`MongoDB connection error: ${err}`));
    mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

    await mongoose.connect(uri);
  } catch (err) {
    if (err instanceof Error) {
      logger.error({ err }, "Initial MongoDB connection error");
    } else {
      logger.error({ err }, "Initial MongoDB connection error occurred with a non-Error object");
    }

    throw err;
  }
};

export default connectDB;
