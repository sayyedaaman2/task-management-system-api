import { Router } from "express";

import * as taskController from "@/controller/task.controller.js";
import { validate } from "@/middleware/validation.middleware.js";
import { createTaskValidation, updateTaskValidation } from "@/validation/task.validation.js";
const router = Router();

router.post("/", validate(createTaskValidation), taskController.createTask);
router.put("/:id", validate(updateTaskValidation), taskController.updateTask);
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.delete("/:id", taskController.deleteTask);

export default router;
