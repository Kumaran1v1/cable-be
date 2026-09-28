"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET || "fallback_default_secret_key";
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: "7d",
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET || "fallback_default_secret_key";
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
