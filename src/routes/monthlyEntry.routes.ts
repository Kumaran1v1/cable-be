import { Router } from "express";
import { MonthlyEntryController } from "../controllers/monthlyEntry.controller";

const router = Router();

router.post("/", MonthlyEntryController.saveMonthlyEntry);
router.get("/customer/:customerId", MonthlyEntryController.getCustomerEntries);
router.get("/customer/:customerId/month/:month", MonthlyEntryController.getSingleMonthEntry);
router.delete("/:id", MonthlyEntryController.deleteEntry);

export default router;
