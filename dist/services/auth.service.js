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
    static async login(email, password) {
        if (!email || !password) {
            throw new Error("Please provide email and password");
        }
        const user = await User_model_1.default.findOne({ email }).select("+password");
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
                role: user.role,
            },
            token,
        };
    }
}
exports.AuthService = AuthService;
