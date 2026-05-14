import { Router } from "express";

import analyticRoutes from "./analytics.route.js";

import * as adminController from "@/controller/admin.controller.js";
import { cacheMiddleware } from "@/middleware/redis.middleware.js";
const router = Router();

router.delete("/users/:id", adminController.deleteUser);
router.delete("/tasks/:id", adminController.deleteTask);

router.get("/users", cacheMiddleware(), adminController.getAllUsers);
router.get("/users/:id/tasks", cacheMiddleware(), adminController.getAllTasksByUser);
router.get("/tasks", cacheMiddleware(), adminController.getAllTasks);

// analytics
router.use("/analytics", analyticRoutes);

export default router;
