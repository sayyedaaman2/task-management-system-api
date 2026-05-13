import path from "node:path";

import dotenv from "dotenv";

const NODE_ENV = process.env.NODE_ENV || "development";

const envFileMap: Record<string, string> = {
  development: ".env.development",
  production: ".env.production",
  test: ".env.test",
};

const envFile = envFileMap[NODE_ENV] || ".env";

const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({
  path: envPath,
});

const requiredEnvVariables = [
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES_IN",
] as const;

for (const envVariable of requiredEnvVariables) {
  if (!process.env[envVariable]) {
    throw new Error(`Missing required environment variable: ${envVariable}`);
  }
}

const env = {
  nodeEnv: NODE_ENV,

  isDevelopment: NODE_ENV === "development",

  isProduction: NODE_ENV === "production",

  isTest: NODE_ENV === "test",

  port: Number(process.env.PORT),

  mongodbUri: process.env.MONGODB_URI as string,

  jwtSecret: process.env.JWT_SECRET as string,

  jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,

  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,

  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string,

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),

  corsOrigin: process.env.CORS_ORIGIN || "*",

  logLevel: process.env.LOG_LEVEL || "info",
};

export default Object.freeze(env);
