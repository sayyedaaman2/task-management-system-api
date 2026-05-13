import UserModel from "@/model/user.model.js";
import type { IUserDocument } from "@/model/user.model.js";
import {AppError}  from "@/utils/error.js";
import { comparePassword, hashPassword } from "@/utils/hash.js";

class AuthService {
  /**
   * Registers a new user
   * @returns Promise<IUserDocument>
   */
  async register(name: string, email: string, password: string): Promise<IUserDocument> {
    // 1. Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new AppError("User already exists",400);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    return await newUser.save();
  }

  async login(email: string, password: string): Promise<IUserDocument> {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new AppError("User not found",404);
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid password",400);
    }

    return user;
  }

  async getProfile(userId: string){
        return await UserModel.findById(userId).select("-password");
    }
}

export default new AuthService();
