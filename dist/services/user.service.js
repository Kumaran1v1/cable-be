"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = __importDefault(require("../models/User.model"));
class UserService {
    static async getAllUsers() {
        return User_model_1.default.find().select("-password").sort({ createdAt: -1 });
    }
    static async getUserById(id) {
        const user = await User_model_1.default.findById(id).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    static async createUser(userData) {
        const existing = await User_model_1.default.findOne({ email: userData.email });
        if (existing) {
            throw new Error("User with this email already exists");
        }
        if (!userData.password) {
            userData.password = "CableDefault@123";
        }
        const user = await User_model_1.default.create(userData);
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
    static async updateUser(id, updateData) {
        if (updateData.password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            updateData.password = await bcryptjs_1.default.hash(updateData.password, salt);
        }
        const user = await User_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    static async updateProfile(userId, profileData) {
        // 1. If email changed, check uniqueness
        if (profileData.email) {
            const emailLower = profileData.email.toLowerCase().trim();
            const existingEmail = await User_model_1.default.findOne({
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
            const existingMobile = await User_model_1.default.findOne({
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
            const salt = await bcryptjs_1.default.genSalt(10);
            profileData.password = await bcryptjs_1.default.hash(profileData.password, salt);
        }
        else {
            delete profileData.password;
        }
        const updatedUser = await User_model_1.default.findByIdAndUpdate(userId, profileData, {
            new: true,
            runValidators: true,
        }).select("-password");
        if (!updatedUser) {
            throw new Error("User profile not found");
        }
        return updatedUser;
    }
    static async deleteUser(id) {
        const user = await User_model_1.default.findByIdAndDelete(id);
        if (!user) {
            throw new Error("User not found");
        }
        return { id };
    }
}
exports.UserService = UserService;
