import joi from "joi";

import { TaskPriority, TaskStatus } from "@/utils/constant.js";

export const createTaskValidation = joi.object({
  title: joi.string().trim().min(3).max(100).required(),

  description: joi.string().trim().min(5).max(1000).required(),

  status: joi
    .string()
    .valid(...TaskStatus.values)
    .default(TaskStatus.PENDING),

  priority: joi
    .string()
    .valid(...TaskPriority.values)
    .default(TaskPriority.MEDIUM),

  dueDate: joi.date().greater("now").required().messages({
    "date.greater": "Due date must be in future",
  }),
});

export const updateTaskValidation = joi
  .object({
    title: joi.string().trim().min(3).max(100).optional(),

    description: joi.string().trim().min(5).max(1000).optional(),

    status: joi
      .string()
      .valid(...TaskStatus.values)
      .optional(),

    priority: joi
      .string()
      .valid(...TaskPriority.values)
      .optional(),

    dueDate: joi.date().greater("now").optional(),
  })
  .min(1);
