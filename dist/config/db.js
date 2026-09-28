"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cable_db";
        await mongoose_1.default.connect(mongoUri);
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    }
};
exports.default = connectDB;
