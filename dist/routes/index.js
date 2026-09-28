"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const router = (0, express_1.Router)();
// Auth Routes
router.use("/auth", auth_routes_1.default);
// Health check route
router.get("/health", (_req, res) => {
    res.json({
        success: true,
        message: "Cable API is running",
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
