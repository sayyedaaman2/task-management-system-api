import type { Express, Request, Response } from "express";
import express from "express";

import serverConfig from "@/config/env.js";
import { corsMiddleware } from "@/middleware/cors.middleware.js";
import { globalErrorHandler } from "@/middleware/error.middleware.js";
import { requestLogger } from "@/middleware/logger.middleware.js";

// Create an instance of the Express application
const app: Express = express();

/**
 *  Middlewares
 */
// Request logging middleware
app.use(requestLogger);

//middleware to parse JSON bodies
app.use(express.json());

//cors middleware
const corsOptions = {
  origin: serverConfig.corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 3600, // 1 hour
};
app.use(corsMiddleware(corsOptions));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// global error handler
app.use(globalErrorHandler);

export default app;
