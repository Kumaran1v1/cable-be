import User from "../models/User.model";
import { IUser } from "../types";

export class UserService {
  static async getAllUsers() {
    return User.find().select("-password").sort({ createdAt: -1 });
  }

  static async getUserById(id: string) {
    const user = await User.findById(id).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async createUser(userData: Partial<IUser>) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      throw new Error("User with this email already exists");
    }

    if (!userData.password) {
      userData.password = "CableDefault@123";
    }

    const user = await User.create(userData);
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  static async updateUser(id: string, updateData: Partial<IUser>) {
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async deleteUser(id: string) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new Error("User not found");
    }
    return { id };
  }
}
