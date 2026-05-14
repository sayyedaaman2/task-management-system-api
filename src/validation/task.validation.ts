import Joi from "joi";

import { TaskPriority, TaskStatus } from "@/utils/constant.js";

export const createTaskValidation = Joi.object({
  title: Joi.string().trim().min(3).max(100).required(),

  description: Joi.string().trim().min(5).max(1000).required(),

  status: Joi
    .string()
    .valid(...TaskStatus.values)
    .default(TaskStatus.PENDING),

  priority: Joi
    .string()
    .valid(...TaskPriority.values)
    .default(TaskPriority.MEDIUM),

  dueDate: Joi.date().greater("now").required().messages({
    "date.greater": "Due date must be in future",
  }),
});

export const updateTaskValidation = Joi
  .object({
    title: Joi.string().trim().min(3).max(100).optional(),

    description: Joi.string().trim().min(5).max(1000).optional(),

    status: Joi
      .string()
      .valid(...TaskStatus.values)
      .optional(),

    priority: Joi
      .string()
      .valid(...TaskPriority.values)
      .optional(),

    dueDate: Joi.date().greater("now").optional(),
  })
  .min(1);
