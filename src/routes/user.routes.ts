import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Public / Demo endpoints (or secure with authenticate middleware as needed)
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
