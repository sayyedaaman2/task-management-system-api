import { Router } from "express";

import analyticRoutes from "./analytics.route.js";

import * as adminController from "@/controller/admin.controller.js";
import { cacheMiddleware } from "@/middleware/redis.middleware.js";
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin only endpoints
 */

// analytics
router.use("/analytics", analyticRoutes);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *       - in: query
 *         name: userStatus
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, email]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Access denied
 */
router.get("/users", cacheMiddleware(), adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/users/:id", adminController.deleteUser);

/**
 * @swagger
 * /admin/users/{id}/tasks:
 *   get:
 *     summary: Get all tasks for a specific user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in progress, completed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Paginated list of tasks for user
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Access denied
 */
router.get("/users/:id/tasks", cacheMiddleware(), adminController.getAllTasksByUser);

/**
 * @swagger
 * /admin/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in progress, completed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Paginated list of all tasks
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Access denied
 */
router.get("/tasks", cacheMiddleware(), adminController.getAllTasks);

/**
 * @swagger
 * /admin/tasks/{id}:
 *   delete:
 *     summary: Delete task by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/tasks/:id", adminController.deleteTask);

export default router;
