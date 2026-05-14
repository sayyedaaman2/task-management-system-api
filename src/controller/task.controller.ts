import type { Request, Response, NextFunction } from "express";

import type { ITask } from "@/model/task.model.js";
import taskService from "@/service/task.service.js";
import { clearCache } from "@/utils/cache.util.js";
import { AppError } from "@/utils/error.js";
import { convertObjectId } from "@/utils/mongoose.util.js";
interface TaskParams {
  id?: string;
}
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const userId = req.user?.userId;
    const { title, description, dueDate, status, priority }: ITask = req.body;

    const payload = {
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo: convertObjectId(userId),
    };
    const task = await taskService.createTask(payload);
    await clearCache(["tasks"], req.user?.id);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const userId = req.user.userId;
    const tasks = await taskService.getAllTasks(userId, req.query);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request<TaskParams>, res: Response, next: NextFunction) => {
  try {
    if (!req?.params?.id) {
      return next(new AppError("id is not defined", 401));
    }

    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    const userId = req.user.userId;
    const id = req.params.id;

    const task = await taskService.getTaskById(id, userId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request<TaskParams>, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (!req.params.id) {
      return next(new AppError("Task id is required", 400));
    }
    const userId = req.user.userId;
    const id = req.params.id;
    const task = await taskService.updateTask(id, userId, req.body);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await clearCache(["tasks"], req.user?.id);

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request<TaskParams>, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (!req.params.id) {
      return next(new AppError("Task id is required", 400));
    }
    const userId = req.user.userId;
    const task = await taskService.deleteTask(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await clearCache(["tasks"], req.user?.id);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
