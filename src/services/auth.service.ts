import User from "../models/User.model";
import { generateToken } from "../utils/token.utils";
import { IUser } from "../types";

export class AuthService {
  static async register(userData: Partial<IUser>) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const user = await User.create(userData);
    const token = generateToken({
      id: user._id.toString(),
      role: user.role,
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async login(email: string, password?: string) {
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({
      id: user._id.toString(),
      role: user.role,
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async logout() {
    return {
      success: true,
      message: "Logged out successfully",
    };
  }
}
