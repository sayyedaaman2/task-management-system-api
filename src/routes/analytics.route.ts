import { Router } from "express";

import * as adminController from "@/controller/admin.controller.js";
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics endpoints
 */

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get system usage data
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: System usage statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *                     totalTasks:
 *                       type: integer
 *                     completedTasks:
 *                       type: integer
 *                     pendingTasks:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Access denied
 */
router.get("/:id", adminController.getUserActivity);

/**
 * @swagger
 * /admin/analytics/{id}:
 *   get:
 *     summary: Get user activity data
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User activity statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                     completedTasks:
 *                       type: integer
 *                     pendingTasks:
 *                       type: integer
 *                     overdueTasks:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Access denied
 */
router.get("/", adminController.getSystemUsageData);

export default router;
