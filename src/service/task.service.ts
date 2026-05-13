import TaskModel, { type ITask } from "@/model/task.model.js";
import UserModel from "@/model/user.model.js";
import { AppError } from "@/utils/error.js";
interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  order?: "asc" | "desc";
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
      page = 1,
      limit = 10,
      search = "",
      status,
      priority,
      sortBy = "createdAt",
      order = "desc",
    } = query;

    // pagination
    const skip = (Number(page) - 1) * Number(limit);

    interface ITaskFilters {
      title?: {
        $regex: string;
        $options: string;
      };
      status?: string;
      priority?: string;
    }
    // filter object
    const filters: ITaskFilters = {
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
    type SortOptions = {
      [key: string]: number;
    };
    // sorting
    const sortOptions: SortOptions = {
      [sortBy]: order === "asc" ? 1 : -1,
    };

    // query
    const tasks = await TaskModel.find(filters)
      .populate("assignedTo", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // total count
    const total = await TaskModel.countDocuments(filters);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: tasks,
    };
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await TaskModel.findOne({
      _id: taskId,
      assignedTo: userId,
    }).populate("assignedTo", "name email");

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    return task;
  }
async updateTask(
  taskId: string,
  userId: string,
  taskData: Partial<ITask>
) {

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
    throw new AppError(
      "Task not found or unauthorized",
      404
    );
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
