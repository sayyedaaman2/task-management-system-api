import { Router } from "express";

import * as authController from "@/controller/auth.controller.js";

import { verifyTokenMiddleware } from "@/middleware/auth.middleware.js";
const router = Router();

// todo : add the validation middleware for the request body using Joi or express-validator
router.post("/register", authController.register);
router.post("/login", authController.login);
router.use(verifyTokenMiddleware); 
router.get("/refresh-token", authController.refreshToken);
router.get("/profile", authController.getProfile);

export default router;
