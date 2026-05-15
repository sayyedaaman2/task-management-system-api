import { Router } from "express";

import * as authController from "@/controller/auth.controller.js";
import { verifyTokenMiddleware } from "@/middleware/auth.middleware.js";
import { validate } from "@/middleware/validation.middleware.js";
import { loginValidation, signUpValidation } from "@/validation/auth.validation.js";
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Test@1234
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */

router.post("/register", validate(signUpValidation), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login (User or Admin)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           examples:
 *             userLogin:
 *               summary: Regular user login
 *               value:
 *                 email: john@example.com
 *                 password: Test@1234
 *             adminLogin:
 *               summary: Admin login
 *               value:
 *                 email: admin@example.com
 *                 password: Password@123
 *     responses:
 *       200:
 *         description: Login successful — copy accessToken and use in Authorize button
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         userType:
 *                           type: string
 *                           enum: [admin, user]
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/login", validate(loginValidation), authController.login);

// verify token middleware
router.use(verifyTokenMiddleware);

/**
 * @swagger
 * /auth/refresh-token:
 *   get:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token
 *       401:
 *         description: Refresh token missing or invalid
 */
router.get("/refresh-token", authController.refreshToken);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authController.getProfile);

export default router;
