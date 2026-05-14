import mongoose from "mongoose";
import type { Model } from "mongoose";

import { TaskStatus, TaskPriority } from "@/utils/constant.js";

export interface ITask {
  title: string;
  description: string;
  status: string;
  dueDate: Date;
  priority: string;
  assignedTo: mongoose.Types.ObjectId;
}

export interface ITaskDocument extends ITask, mongoose.Document {}
const taskSchema = new mongoose.Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: TaskStatus.values,
      default: TaskStatus.PENDING,
    },
    priority: {
      type: String,
      enum: TaskPriority.values,
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Task: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>("Task", taskSchema);
export default Task;
