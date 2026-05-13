import {Router} from "express";


import analyticRoutes from './analytics.route.js'

import * as adminController from "@/controller/admin.controller.js";


const router = Router();

router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteUser);
router.get("/users/:id/tasks", adminController.getAllTasksByUser);
router.get("/tasks", adminController.getAllTasks);
router.delete("/tasks/:id", adminController.deleteTask);


// analytics
router.use("/analytics",analyticRoutes);

export default router;