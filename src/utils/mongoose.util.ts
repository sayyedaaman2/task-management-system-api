import mongoose from "mongoose";

import { AppError } from "./error.js";

export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const convertObjectId = (id: string): mongoose.Types.ObjectId => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid ObjectId", 400);
  }

  return new mongoose.Types.ObjectId(id);
};
