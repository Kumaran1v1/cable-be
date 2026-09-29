import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// GET /api/dashboard/summary?year=YYYY&month=YYYY-MM
router.get("/summary", getDashboardSummary);

export default router;
