"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "cable_default_secret_key_2026";
// POST /api/auth/login
router.post("/login", async (req, res, next) => {
    try {
        const { identifier, email, mobile, username, password } = req.body || {};
        const loginId = (identifier || email || mobile || username || "").toString().trim();
        if (!loginId || !password) {
            res.status(400).json({
                success: false,
                message: "Email/Username and password are required",
            });
            return;
        }
        // Try finding user by email, mobile, or name
        let user = await User_model_1.default.findOne({
            $or: [
                { email: loginId.toLowerCase() },
                { mobile: loginId },
                { name: loginId },
            ],
        }).select("+password");
        // Auto-seed initial admin user if collection is empty
        if (!user) {
            const totalUsers = await User_model_1.default.countDocuments();
            if (totalUsers === 0) {
                user = await User_model_1.default.create({
                    name: "Administrator",
                    email: loginId.includes("@") ? loginId.toLowerCase() : "admin@cable.com",
                    mobile: "9876543210",
                    companyName: "Cable Network",
                    password,
                    role: "ADMIN",
                });
            }
        }
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        const passwordMatch = await user.comparePassword(password);
        if (!passwordMatch) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        }, JWT_SECRET, { expiresIn: "7d" });
        res.json({
            success: true,
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                companyName: user.companyName || "Cable Network",
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/auth/profile
router.get("/profile", authMiddleware_1.authenticateJWT, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const user = await User_model_1.default.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                companyName: user.companyName,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
