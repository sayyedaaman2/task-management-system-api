import mongoose from "mongoose";

import { UserTypes, UserStatus } from "@/utils/constant.js";

export interface IUser {
  name: string;
  email: string;
  password: string;
  userType: (typeof UserTypes.values)[number];
  userStatus: (typeof UserStatus.values)[number];
}

export interface IUserDocument extends IUser, mongoose.Document {}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

const User = mongoose.models.user || mongoose.model<IUser>("User", userSchema);

export default User;
