import { Router } from "express";

import * as authController from "@/controller/auth.controller.js";
import { verifyTokenMiddleware } from "@/middleware/auth.middleware.js";
import { validate } from "@/middleware/validation.middleware.js";
import { loginValidation, signUpValidation } from "@/validation/auth.validation.js";
const router = Router();

router.post("/register", validate(signUpValidation), authController.register);
router.post("/login", validate(loginValidation), authController.login);
router.use(verifyTokenMiddleware);
router.get("/refresh-token", authController.refreshToken);
router.get("/profile", authController.getProfile);

export default router;
