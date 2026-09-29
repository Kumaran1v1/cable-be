"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const token_utils_1 = require("../utils/token.utils");
class AuthService {
    static async register(userData) {
        const existingUser = await User_model_1.default.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        const user = await User_model_1.default.create(userData);
        const token = (0, token_utils_1.generateToken)({
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
    static async login(identifier, password) {
        if (!identifier || !password) {
            throw new Error("Please provide email/mobile and password");
        }
        const trimmed = identifier.trim();
        const isEmail = trimmed.includes("@");
        // Find user by either email or mobile number
        const user = await User_model_1.default.findOne({
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
        const token = (0, token_utils_1.generateToken)({
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
exports.AuthService = AuthService;
