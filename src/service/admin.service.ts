import type { SortOrder } from "mongoose";

import TaskModel from "@/model/task.model.js";
import UserModel from "@/model/user.model.js";
import type { IUserDocument } from "@/model/user.model.js";
import { TaskStatus } from "@/utils/constant.js";
import { AppError } from "@/utils/error.js";

interface GetUsersQuery {
  page?: string;
  limit?: string;
  search?: string;
  userStatus?: string;
  userType?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}
interface GetTasksByUserQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

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
  title?: {
    $regex: string;
    $options: string;
  };

  status?: string;

  priority?: string;
}
class AdminService {
  async getAllUsers(query: GetUsersQuery) {
    const {
      page = "1",
      limit = "10",
      search = "",
      userStatus,
      userType,
      sortBy = "createdAt",
      order = "desc",
    } = query;

    // pagination
    const skip = (Number(page) - 1) * Number(limit);

    // filters
    const filters: any = {};

    // search by name/email
    if (search) {
      filters.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // filter by status
    if (userStatus) {
      filters.userStatus = userStatus;
    }

    // filter by type
    if (userType) {
      filters.userType = userType;
    }

    // allowed sort fields
    const allowedSortFields = ["createdAt", "name", "email"];

    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    // sorting
    const sortOptions = {
      [finalSortBy]: order === "asc" ? 1 : -1,
    };

    // query users
    const users = await UserModel.find(filters)
      .select("-password")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // total count
    const total = await UserModel.countDocuments(filters);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: users,
    };
  }
  async deleteUser(id: string): Promise<IUserDocument> {
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new AppError("User not found", 404);
    }
    return deletedUser;
  }
  async getAllTasksByUser(userId: string, query: GetTasksByUserQuery) {
    const {
      page = "1",
      limit = "10",
      search = "",
      status,
      priority,
      sortBy = "createdAt",
      order = "desc",
    } = query;

    // pagination
    const skip = (Number(page) - 1) * Number(limit);

    // filters
    const filters: any = {
      assignedTo: userId,
    };

    // search by title
    if (search) {
      filters.title = {
        $regex: search,
        $options: "i",
      };
    }

    // filter by status
    if (status) {
      filters.status = status;
    }

    // filter by priority
    if (priority) {
      filters.priority = priority;
    }

    // allowed sorting fields
    const allowedSortFields = ["createdAt", "title", "dueDate", "priority", "status"];

    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    // sorting
    const sortOptions = {
      [finalSortBy]: order === "asc" ? 1 : -1,
    };

    // query
    const tasks = await TaskModel.find(filters)
      .populate("assignedTo", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // total
    const total = await TaskModel.countDocuments(filters);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: tasks,
    };
  }

  async getAllTasks(query: QueryParams) {
    const {
      page = "1",
      limit = "10",
      search = "",
      status,
      priority,
      sortBy = "createdAt",
      order = "desc",
    } = query;

    /**
     * Pagination
     */
    const parsedPage = Math.max(1, Number(page));

    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));

    const skip = (parsedPage - 1) * parsedLimit;

    /**
     * Filters
     */
    const filters: ITaskFilters = {};

    /**
     * Search
     */
    if (search) {
      filters.title = {
        $regex: search,
        $options: "i",
      };
    }

    /**
     * Filter by status
     */
    if (status) {
      filters.status = status;
    }

    /**
     * Filter by priority
     */
    if (priority) {
      filters.priority = priority;
    }

    /**
     * Allowed sorting
     */
    const allowedSortFields = ["createdAt", "title", "priority", "dueDate", "status"];

    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    /**
     * Sorting
     */
    const sortOptions: Record<string, SortOrder> = {
      [finalSortBy]: order === "asc" ? 1 : -1,
    };

    /**
     * Query
     */
    const tasks = await TaskModel.find(filters)
      .populate("assignedTo", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    /**
     * Total count
     */
    const total = await TaskModel.countDocuments(filters);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      data: tasks,
    };
  }

  async deleteTask(id: string): Promise<`ITaskDocument`> {
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new AppError("User not found", 404);
    }
    return deletedUser;
  }

  async analyzeUserActivity(userId: string) {
    const totalTasks = await TaskModel.countDocuments({ assignedTo: userId });
    const completedTasks = await TaskModel.countDocuments({
      assignedTo: userId,
      status: "completed",
    });
    const pendingTasks = await TaskModel.countDocuments({ assignedTo: userId, status: "pending" });
    const overdueTasks = await TaskModel.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    };
  }
  async analyzeSystemUsage() {
    // date for active users
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // run queries in parallel
    const [totalUsers, activeUsers, totalTasks, completedTasks, pendingTasks] = await Promise.all([
      UserModel.countDocuments(),

      UserModel.countDocuments({
        lastLogin: {
          $gte: last30Days,
        },
      }),

      TaskModel.countDocuments(),

      TaskModel.countDocuments({
        status: TaskStatus.COMPLETED,
      }),

      TaskModel.countDocuments({
        status: TaskStatus.PENDING,
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
    };
  }
}

export default new AdminService();
