import { Router } from "express";
import authRoutes from "./auth.routes";
import customerRoutes from "./customer.routes";
import monthlyEntryRoutes from "./monthlyEntry.routes";
import dashboardRoutes from "./dashboard.routes";
import userRoutes from "./user.routes";

const router = Router();

// Auth Routes
router.use("/auth", authRoutes);

// User & Profile Routes
router.use("/users", userRoutes);

// Customer Routes
router.use("/customers", customerRoutes);

// Monthly Entry Routes
router.use("/monthly-entries", monthlyEntryRoutes);

// Dashboard Routes
router.use("/dashboard", dashboardRoutes);

// Health check route
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Cable API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
