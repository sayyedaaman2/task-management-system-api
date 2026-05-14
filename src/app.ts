import type { Express, Request, Response } from "express";
import express from "express";

import serverConfig from "@/config/env.js";
import { cookieMiddleware } from "@/middleware/cookie.middleware.js";
import { corsMiddleware } from "@/middleware/cors.middleware.js";
import { globalErrorHandler } from "@/middleware/error.middleware.js";
import { helmetMiddleware } from "@/middleware/helmet.middleware.js";
import { requestLogger } from "@/middleware/logger.middleware.js";
import { notFound } from "@/middleware/notfound.middleware.js";
import { rateLimitMiddleware } from "@/middleware/ratelimit.middleware.js";
import routes from "@/routes/index.js";
import healthCheck from "./controller/health.controller.js";

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

// cookie parser middleware
app.use(cookieMiddleware);

// Request logging middleware
app.use(requestLogger);

// Rate limiting middleware
app.use(rateLimitMiddleware);

// Health check 
app.get("/health",healthCheck)

// Define a simple route for testing
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
