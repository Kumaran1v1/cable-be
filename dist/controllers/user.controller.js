"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const User_model_1 = __importDefault(require("../models/User.model"));
class UserController {
    static async getAllUsers(_req, res, next) {
        try {
            const users = await user_service_1.UserService.getAllUsers();
            res.json({
                success: true,
                data: users,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserById(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const user = await user_service_1.UserService.getUserById(id);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createUser(req, res, next) {
        try {
            const user = await user_service_1.UserService.createUser(req.body);
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUser(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const user = await user_service_1.UserService.updateUser(id, req.body);
            res.json({
                success: true,
                message: "User updated successfully",
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
            let userId = req.user?.id;
            if (!userId) {
                const defaultUser = await User_model_1.default.findOne();
                if (!defaultUser) {
                    return res.status(404).json({ success: false, message: "No user found" });
                }
                userId = defaultUser._id.toString();
            }
            const user = await user_service_1.UserService.getUserById(userId);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            let userId = req.user?.id;
            if (!userId) {
                const defaultUser = await User_model_1.default.findOne();
                if (!defaultUser) {
                    return res.status(404).json({ success: false, message: "No user found" });
                }
                userId = defaultUser._id.toString();
            }
            const updated = await user_service_1.UserService.updateProfile(userId, req.body);
            res.json({
                success: true,
                message: "Profile updated successfully",
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteUser(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            await user_service_1.UserService.deleteUser(id);
            res.json({
                success: true,
                message: "User deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
