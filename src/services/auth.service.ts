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

  static async login(identifier: string, password?: string) {
    if (!identifier || !password) {
      throw new Error("Please provide email/mobile and password");
    }

    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");
    
    // Find user by either email or mobile number
    const user = await User.findOne({
      $or: [
        { email: trimmed.toLowerCase() },
        { mobile: trimmed },
      ],
    }).select("+password");

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
        mobile: user.mobile,
        companyName: user.companyName || "Cable Network",
        age: user.age,
        gender: user.gender,
        profileImage: user.profileImage,
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
