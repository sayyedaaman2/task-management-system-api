import type { SortOrder } from "mongoose";

import TaskModel from "@/model/task.model.js";
import type { ITaskDocument } from "@/model/task.model.js";
import UserModel from "@/model/user.model.js";
import type { IUserDocument } from "@/model/user.model.js";
import { AppError } from "@/utils/error.js";

import { UserTypes, UserStatus, TaskStatus } from "@/utils/constant.js";

interface UserFilters {
  $or?: Array<{
    name?: {
      $regex: string;
      $options: string;
    };

    email?: {
      $regex: string;
      $options: string;
    };
  }>;

  userStatus?: (typeof UserStatus.values)[number];

  userType?: (typeof UserTypes.values)[number];
}

interface TaskFilters {
  assignedTo?: string;

  title?: {
    $regex: string;
    $options: string;
  };

  status?: string;

  priority?: string;

  dueDate?: {
    $lt?: Date;
  };
}
/**
 * SHARED INTERFACES
 */
interface BaseQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

interface GetUsersQuery extends BaseQuery {
  userStatus?: string;
  userType?: string;
}

interface GetTasksQuery extends BaseQuery {
  status?: string;
  priority?: string;
}

interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}

class AdminService {
  async getAllUsers(query: GetUsersQuery): Promise<PaginatedResponse<IUserDocument>> {
    const {
      page = "1",
      limit = "10",
      search = "",
      userStatus,
      userType,
      sortBy = "createdAt",
      order = "desc",
    } = query;

    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (parsedPage - 1) * parsedLimit;

    // Use FilterQuery from Mongoose
    const filters: UserFilters = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (userType && !UserTypes.values.includes(userType as (typeof UserTypes.values)[number])) {
      throw new AppError("Invalid user type", 400);
    }

    if (userType) {
      filters.userType = userType as (typeof UserTypes.values)[number];
    }
    if (
      userStatus &&
      !UserStatus.values.includes(userStatus as (typeof UserStatus.values)[number])
    ) {
      throw new AppError("Invalid user status", 400);
    }

    if (userStatus) {
      filters.userStatus = userStatus as (typeof UserStatus.values)[number];
    }

    const allowedSortFields = ["createdAt", "name", "email"];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sortOptions: Record<string, SortOrder> = {
      [finalSortBy]: order === "asc" ? 1 : -1,
    };

    const users = await UserModel.find(filters)
      .select("-password")
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const total = await UserModel.countDocuments(filters);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      data: users,
    };
  }

  async deleteUser(id: string): Promise<IUserDocument | null> {
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new AppError("User not found", 404);
    }
    return deletedUser;
  }

  async getAllTasksByUser(
    userId: string,
    query: GetTasksQuery
  ): Promise<PaginatedResponse<ITaskDocument>> {
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

    const filters: TaskFilters = { assignedTo: userId };

    if (search) {
      filters.title = { $regex: search, $options: "i" };
    }

    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    const allowedSortFields = ["createdAt", "title", "dueDate", "priority", "status"];
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

  async getAllTasks(query: GetTasksQuery): Promise<PaginatedResponse<ITaskDocument>> {
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

    const filters: TaskFilters = {};

    if (search) {
      filters.title = { $regex: search, $options: "i" };
    }

    if (status) filters.status = status;
    if (priority) filters.priority = priority;

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

  async deleteTask(id: string): Promise<ITaskDocument> {
    const deletedTask = await TaskModel.findByIdAndDelete(id);
    if (!deletedTask) {
      throw new AppError("Task not found", 404);
    }
    return deletedTask;
  }

  async analyzeUserActivity(userId: string) {
    const totalTasks = await TaskModel.countDocuments({ assignedTo: userId });
    const completedTasks = await TaskModel.countDocuments({
      assignedTo: userId,
      status: TaskStatus.COMPLETED, // Use Constant
    });
    const pendingTasks = await TaskModel.countDocuments({
      assignedTo: userId,
      status: TaskStatus.PENDING,
    });
    const overdueTasks = await TaskModel.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatus.COMPLETED },
    });

    return { totalTasks, completedTasks, pendingTasks, overdueTasks };
  }

  async analyzeSystemUsage() {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, totalTasks, completedTasks, pendingTasks] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ lastLogin: { $gte: last30Days } }),
      TaskModel.countDocuments(),
      TaskModel.countDocuments({ status: TaskStatus.COMPLETED }),
      TaskModel.countDocuments({ status: TaskStatus.PENDING }),
    ]);

    return { totalUsers, activeUsers, totalTasks, completedTasks, pendingTasks };
  }
}

export default new AdminService();
