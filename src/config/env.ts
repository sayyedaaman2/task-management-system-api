import path from "node:path";

import dotenv from "dotenv";

const NODE_ENV = process.env.NODE_ENV || "development";

const envFileMap: Record<string, string> = {
  development: ".env.development",
  production: ".env.production",
  test: ".env.test",
};

const envFile = envFileMap[NODE_ENV] || ".env";

dotenv.config({
  path: path.resolve(process.cwd(), envFile),
});

/**
 * Validate required envs
 */
const requiredEnvVariables = [
  "PORT",
  "MONGODB_URI",
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_TTL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES_IN",
] as const;

for (const envVariable of requiredEnvVariables) {
  if (process.env[envVariable] === undefined) {
    throw new Error(`Missing required environment variable: ${envVariable}`);
  }
}

/**
 * Safe number parser
 */
const parseNumber = (value: string | undefined, name: string): number => {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric env variable: ${name}`);
  }

  return parsed;
};

const env = {
  nodeEnv: NODE_ENV,

  isDevelopment: NODE_ENV === "development",
  isProduction: NODE_ENV === "production",
  isTest: NODE_ENV === "test",

  port: parseNumber(process.env.PORT, "PORT"),

  mongodbUri: process.env.MONGODB_URI!,

  redis: {
    host: process.env.REDIS_HOST!,

    port: parseNumber(process.env.REDIS_PORT, "REDIS_PORT"),

    username: process.env.REDIS_USERNAME,

    password: process.env.REDIS_PASSWORD,

    ttl: parseNumber(process.env.REDIS_TTL, "REDIS_TTL"),
  },

  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN!,

  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,

  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,

  bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS || "10", "BCRYPT_SALT_ROUNDS"),

  corsOrigin: process.env.CORS_ORIGIN || "*",

  logLevel: process.env.LOG_LEVEL || "info",
};

export default Object.freeze(env);
