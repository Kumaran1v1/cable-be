"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.register(req.body);
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, mobile, identifier, password } = req.body;
            const loginId = identifier || email || mobile;
            const result = await auth_service_1.AuthService.login(loginId, password);
            res.json({
                success: true,
                message: "Logged in successfully",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(_req, res, next) {
        try {
            res.clearCookie("token");
            res.clearCookie("jwt");
            const result = await auth_service_1.AuthService.logout();
            res.json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
