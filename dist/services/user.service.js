"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
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
            role: user.role,
            createdAt: user.createdAt,
        };
    }
    static async updateUser(id, updateData) {
        const user = await User_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
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
