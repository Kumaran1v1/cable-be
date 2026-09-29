import bcrypt from "bcryptjs";
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
      mobile: user.mobile,
      companyName: user.companyName,
      age: user.age,
      gender: user.gender,
      profileImage: user.profileImage,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  static async updateUser(id: string, updateData: Partial<IUser>) {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async updateProfile(userId: string, profileData: Partial<IUser>) {
    // 1. If email changed, check uniqueness
    if (profileData.email) {
      const emailLower = profileData.email.toLowerCase().trim();
      const existingEmail = await User.findOne({
        email: emailLower,
        _id: { $ne: userId },
      });
      if (existingEmail) {
        throw new Error("Email address is already in use by another user");
      }
      profileData.email = emailLower;
    }

    // 2. If mobile changed, check uniqueness
    if (profileData.mobile) {
      const trimmedMobile = profileData.mobile.trim();
      const existingMobile = await User.findOne({
        mobile: trimmedMobile,
        _id: { $ne: userId },
      });
      if (existingMobile) {
        throw new Error("Mobile number is already registered to another user");
      }
      profileData.mobile = trimmedMobile;
    }

    // 3. If password updated, hash it
    if (profileData.password) {
      if (profileData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      const salt = await bcrypt.genSalt(10);
      profileData.password = await bcrypt.hash(profileData.password, salt);
    } else {
      delete profileData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, profileData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      throw new Error("User profile not found");
    }

    return updatedUser;
  }

  static async deleteUser(id: string) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new Error("User not found");
    }
    return { id };
  }
}

