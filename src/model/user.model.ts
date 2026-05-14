import mongoose from "mongoose";
import type { Model } from "mongoose";

import { UserTypes, UserStatus } from "@/utils/constant.js";

export interface IUser {
  name: string;
  email: string;
  password: string;

  userType: (typeof UserTypes.values)[number];

  userStatus: (typeof UserStatus.values)[number];

  lastLogin?: Date | null;
}

export interface IUserDocument extends IUser, mongoose.Document {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    userType: {
      type: String,
      enum: UserTypes.values,
      default: UserTypes.USER,
    },

    userStatus: {
      type: String,
      enum: UserStatus.values,
      default: UserStatus.ACTIVE,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", userSchema);

export default User;
