import type { Request, Response, NextFunction } from "express";

import type { ITask } from "@/model/task.model.js";
import taskService from "@/service/task.service.js";

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { title, description, dueDate, status }: ITask = req.body;

    const payload = {
      title,
      description,
      dueDate,
      status,
      assignedTo: userId,
    };
    const task = await taskService.createTask(payload);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const tasks = await taskService.getAllTasks(userId, req.query);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;

    const task = await taskService.getTaskById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const task = await taskService.updateTask(req.params.id, userId, req.body);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const task = await taskService.deleteTask(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
