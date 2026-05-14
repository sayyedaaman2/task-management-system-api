import type { SortOrder } from "mongoose";

import TaskModel, { type ITask } from "@/model/task.model.js";
import UserModel from "@/model/user.model.js";
import { AppError } from "@/utils/error.js";
import { convertObjectId, isValidObjectId } from "@/utils/mongoose.util.js";

interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

interface ITaskFilters {
  assignedTo: string;

  title?: {
    $regex: string;
    $options: string;
  };

  status?: string;

  priority?: string;
}
class TaskService {
  async createTask(taskData: ITask) {
    // check assigning user is exist or not will be done in controller layer
    const assignedToUser = await UserModel.findById(taskData.assignedTo);
    if (!assignedToUser) {
      throw new AppError("assignedTo not found", 404);
    }
    const task = new TaskModel(taskData);
    return await task.save();
  }

  async getAllTasks(userId: string, query: QueryParams) {
    const {
      page = "1",
      limit = "10",
      search = "",
      status,
      priority,
      sortBy = "createdAt",
      order = "desc",
    } = query;

    const parsedPage = Math.max(1, Number(page));

    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: ITaskFilters = {
      assignedTo: userId,
    };

    if (search) {
      filters.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      filters.status = status;
    }

    if (priority) {
      filters.priority = priority;
    }

    const allowedSortFields = ["createdAt", "title", "priority", "dueDate", "status"];

    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sortOptions: Record<string, SortOrder> = {
      [finalSortBy]: order === "asc" ? 1 : -1,
    };

    const tasks = await TaskModel.find(filters)
      .populate("assignedTo", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const total = await TaskModel.countDocuments(filters);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      data: tasks,
    };
  }

  async getTaskById(taskId: string, userId: string) {
    if (!isValidObjectId(taskId)) {
      throw new AppError("Invalid task id", 400);
    }

    if (!isValidObjectId(userId)) {
      throw new AppError("Invalid user id", 400);
    }

    const task = await TaskModel.findOne({
      _id: convertObjectId(taskId),
    }).populate("assignedTo", "name email");

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    return task;
  }
  async updateTask(taskId: string, userId: string, taskData: Partial<ITask>) {
    const task = await TaskModel.findOneAndUpdate(
      {
        _id: taskId,
        assignedTo: userId,
      },
      taskData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      throw new AppError("Task not found or unauthorized", 404);
    }

    return task;
  }
  async deleteTask(taskId: string, userId: string) {
    const task = await TaskModel.findOneAndDelete({
      _id: taskId,
      assignedTo: userId,
    });

    if (!task) {
      throw new AppError("Task not found or unauthorized", 404);
    }

    return task;
  }
}

export default new TaskService();
