import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

// Auth Routes
router.use("/auth", authRoutes);

// Health check route
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Cable API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
