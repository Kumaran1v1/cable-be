"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const customer_routes_1 = __importDefault(require("./customer.routes"));
const monthlyEntry_routes_1 = __importDefault(require("./monthlyEntry.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const router = (0, express_1.Router)();
// Auth Routes
router.use("/auth", auth_routes_1.default);
// User & Profile Routes
router.use("/users", user_routes_1.default);
// Customer Routes
router.use("/customers", customer_routes_1.default);
// Monthly Entry Routes
router.use("/monthly-entries", monthlyEntry_routes_1.default);
// Dashboard Routes
router.use("/dashboard", dashboard_routes_1.default);
// Health check route
router.get("/health", (_req, res) => {
    res.json({
        success: true,
        message: "Cable API is running",
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
