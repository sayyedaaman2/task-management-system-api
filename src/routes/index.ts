import { Router } from "express";

import authRoutes from "./auth.route.js";
import taskRoutes from "./task.route.js";
import adminRoutes from "./admin.route.js";

import { verifyTokenMiddleware } from "@/middleware/auth.middleware.js";
const router = Router();

router.use("/auth", authRoutes);

router.use(verifyTokenMiddleware);
router.use("/tasks", taskRoutes);

router.use('/admin',adminRoutes)
export default router;
