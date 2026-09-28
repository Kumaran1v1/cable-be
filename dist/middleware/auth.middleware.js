"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const token_utils_1 = require("../utils/token.utils");
const authenticate = (req, res, next) => {
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
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "Forbidden: You do not have permissions for this resource",
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
