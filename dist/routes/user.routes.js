"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Profile endpoints (specific routes must come before /:id)
router.get("/profile", auth_middleware_1.authenticate, user_controller_1.UserController.getProfile);
router.put("/profile", auth_middleware_1.authenticate, user_controller_1.UserController.updateProfile);
// Public / Demo endpoints (or secure with authenticate middleware as needed)
router.get("/", user_controller_1.UserController.getAllUsers);
router.get("/:id", user_controller_1.UserController.getUserById);
router.post("/", user_controller_1.UserController.createUser);
router.put("/:id", user_controller_1.UserController.updateUser);
router.delete("/:id", user_controller_1.UserController.deleteUser);
exports.default = router;
