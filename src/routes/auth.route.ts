import {Router} from "express";

import * as authController from "@/controller/auth.controller.js";

const router = Router();

// todo : add the validation middleware for the request body using Joi or express-validator
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/refresh-token", authController.refreshToken);

export default router;