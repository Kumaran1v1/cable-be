"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.authenticateJWT = void 0;
const token_utils_1 = require("../utils/token.utils");
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Authorization token missing or malformed",
        });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = (0, token_utils_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.authenticateJWT = authenticateJWT;
exports.authenticate = exports.authenticateJWT;
