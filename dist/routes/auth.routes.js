"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
        const normalized = loginId.toLowerCase();
        let user = await User_model_1.default.findOne({
            $or: [
                { email: normalized },
                { email: normalized === "admin" ? "admin@cable.com" : normalized },
                { mobile: loginId },
                { name: loginId },
            ],
        }).select("+password");
        // Auto-seed initial admin user if collection is empty or admin not present
        if (!user && (normalized === "admin" || normalized === "admin@cable.com")) {
            user = await User_model_1.default.create({
                name: "Administrator",
                email: "admin@cable.com",
                mobile: "9876543210",
                companyName: "Cable Network",
                password: password || "admin123",
                role: "ADMIN",
            });
        }
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        let passwordMatch = await user.comparePassword(password);
        // Allow standard admin fallback passwords
        if (!passwordMatch && (normalized === "admin" || normalized === "admin@cable.com")) {
            if (password === "admin123" || password === "password123" || password === "admin") {
                user.password = password;
                await user.save();
                passwordMatch = true;
            }
        }
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
                age: user.age,
                gender: user.gender,
                profileImage: user.profileImage,
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
            data: {
                id: user._id.toString(),
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                companyName: user.companyName || "Cable Network",
                age: user.age,
                gender: user.gender,
                profileImage: user.profileImage,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/auth/profile
router.put("/profile", authMiddleware_1.authenticateJWT, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const { name, email, mobile, companyName, age, gender, profileImage, password } = req.body || {};
        const updateData = {};
        if (name)
            updateData.name = name.trim();
        if (companyName)
            updateData.companyName = companyName.trim();
        if (gender !== undefined)
            updateData.gender = gender;
        if (profileImage !== undefined)
            updateData.profileImage = profileImage;
        if (age !== undefined && age !== "")
            updateData.age = Number(age);
        // Email uniqueness
        if (email) {
            const lowerEmail = email.toLowerCase().trim();
            const existingEmail = await User_model_1.default.findOne({ email: lowerEmail, _id: { $ne: userId } });
            if (existingEmail) {
                res.status(400).json({ success: false, message: "Email is already in use by another account" });
                return;
            }
            updateData.email = lowerEmail;
        }
        // Mobile uniqueness
        if (mobile) {
            const trimmedMobile = mobile.trim();
            const existingMobile = await User_model_1.default.findOne({ mobile: trimmedMobile, _id: { $ne: userId } });
            if (existingMobile) {
                res.status(400).json({ success: false, message: "Mobile number is already in use by another account" });
                return;
            }
            updateData.mobile = trimmedMobile;
        }
        // Password update
        if (password) {
            if (password.length < 6) {
                res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
                return;
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            updateData.password = await bcryptjs_1.default.hash(password, salt);
        }
        const updatedUser = await User_model_1.default.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");
        if (!updatedUser) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: updatedUser._id.toString(),
                _id: updatedUser._id.toString(),
                name: updatedUser.name,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                role: updatedUser.role,
                companyName: updatedUser.companyName || "Cable Network",
                age: updatedUser.age,
                gender: updatedUser.gender,
                profileImage: updatedUser.profileImage,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/auth/logout
router.post("/logout", async (_req, res, next) => {
    try {
        res.clearCookie("token");
        res.clearCookie("jwt");
        res.json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/auth/logout (fallback support)
router.get("/logout", async (_req, res, next) => {
    try {
        res.clearCookie("token");
        res.clearCookie("jwt");
        res.json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
