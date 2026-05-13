import { Router } from "express";

import adminRoutes from "./admin.route.js";
import authRoutes from "./auth.route.js";
import taskRoutes from "./task.route.js";

import { verifyTokenMiddleware,verifyAdminAccessMiddleware } from "@/middleware/auth.middleware.js";
const router = Router();

router.use("/auth", authRoutes);

router.use(verifyTokenMiddleware);
router.use("/tasks", taskRoutes);

router.use(verifyAdminAccessMiddleware);
router.use('/admin',adminRoutes)
export default router;
