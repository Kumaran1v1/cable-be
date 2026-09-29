"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// Health Check Endpoint
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "API is running",
    });
});
// Main API Routes
app.use("/api", routes_1.default);
app.use("/api/api", routes_1.default); // Fallback for clients prefixing /api twice
// Error Handling Middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
