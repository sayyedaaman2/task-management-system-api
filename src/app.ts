import type { Express, Request, Response } from "express";
import express from "express";
import swaggerUi from "swagger-ui-express";

import healthCheck from "./controller/health.controller.js";

import serverConfig from "@/config/env.js";
import swaggerSpec from "@/config/swagger.js";
import { cookieMiddleware } from "@/middleware/cookie.middleware.js";
import { corsMiddleware } from "@/middleware/cors.middleware.js";
import { globalErrorHandler } from "@/middleware/error.middleware.js";
import { helmetMiddleware } from "@/middleware/helmet.middleware.js";
import { requestLogger } from "@/middleware/logger.middleware.js";
import { notFound } from "@/middleware/notfound.middleware.js";
import { rateLimitMiddleware } from "@/middleware/ratelimit.middleware.js";
import routes from "@/routes/index.js";

// Create an instance of the Express application
const app: Express = express();

/**
 *  Middlewares
 */

// Security middleware
app.use(helmetMiddleware);

//cors middleware
const corsOptions = {
  origin: serverConfig.corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 3600, // 1 hour
};
app.use(corsMiddleware(corsOptions));

//middleware to parse JSON bodies
app.use(express.json());

// swagger UI api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// cookie parser middleware
app.use(cookieMiddleware);

// Request logging middleware
app.use(requestLogger);

// Rate limiting middleware
app.use(rateLimitMiddleware);

// Health check
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 */

app.get("/health", healthCheck);

// Define a simple route for testing
/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Hello World
 */
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// API routes
app.use("/api/v1", routes);

// not found routes
app.use(notFound);

// global error handler
app.use(globalErrorHandler);

export default app;
