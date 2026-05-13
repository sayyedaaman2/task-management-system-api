import type {Request, Response, NextFunction} from 'express'

import userService from "@/service/admin.service.js";
import {AppError} from '@/utils/error.js'


export const getAllUsers = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const users = await userService.getAllUsers(req.query)
    res.status(200).json(users)
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Failed to get users', 500))
  }
}

export const deleteUser = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const userId = req.params.id
    await userService.deleteUser(userId)
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Failed to delete user', 500))
  }
}

export const getAllTasksByUser = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const userId = req.params.id
    const tasks = await userService.getAllTasksByUser(userId, req.query)
    res.status(200).json(tasks)
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Failed to get tasks for user', 500))
  }
}
export const getAllTasks = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const tasks = await userService.getAllTasks(req.query)
    res.status(200).json(tasks)
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Failed to get tasks', 500))
  }
}

export const deleteTask = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const taskId = req.params.id
    await userService.deleteTask(taskId)
    res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Failed to delete task', 500))
  }
}