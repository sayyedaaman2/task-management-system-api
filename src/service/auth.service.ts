import UserModel from "@/model/user.model.js";
import type { IUserDocument } from "@/model/user.model.js";
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
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    return await newUser.save().lean();
  }

  async login(email: string, password: string): Promise<IUserDocument> {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    return user;
  }
}

export default new AuthService();
