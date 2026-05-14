import type { Request, Response, NextFunction } from "express";

import adminService from "@/service/admin.service.js";
import { AppError } from "@/utils/error.js";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getAllUsers(req.query);
    res.status(200).json(users);
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Failed to get users", 500));
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    await adminService.deleteUser(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Failed to delete user", 500));
  }
};

export const getAllTasksByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const tasks = await adminService.getAllTasksByUser(userId, req.query);
    res.status(200).json(tasks);
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Failed to get tasks for user", 500));
  }
};
export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await adminService.getAllTasks(req.query);
    res.status(200).json(tasks);
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Failed to get tasks", 500));
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id;
    await adminService.deleteTask(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Failed to delete task", 500));
  }
};

export const getUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const data = await adminService.analyzeUserActivity(userId);
    res.status(200).json({ message: "Successfully Fetched User Activities", data });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Failed to delete task", 500));
  }
};

export const getSystemUsageData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.analyzeSystemUsage();
    res.status(200).json({ message: "Successfully Fetched System Usage data", data });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Failed to delete task", 500));
  }
};
