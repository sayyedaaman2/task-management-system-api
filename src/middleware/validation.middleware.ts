import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";

import { AppError } from "@/utils/error.js";

export const validate =
  (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((err) => err.message);

      return next(new AppError(errorMessages.join(", "), 400));
    }

    req.body = value;

    next();
  };
