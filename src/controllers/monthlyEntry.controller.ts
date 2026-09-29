import { Request, Response, NextFunction } from "express";
import MonthlyEntry from "../models/MonthlyEntry.model";
import Customer from "../models/Customer.model";

// Helper to get current YYYY-MM
const getCurrentMonthString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export class MonthlyEntryController {
  // POST /api/monthly-entries - Create or update single monthly entry per customer
  static async saveMonthlyEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, month, amount, paymentStatus, paidAmount, remarks } = req.body;

      if (!customerId) {
        res.status(400).json({ success: false, message: "Customer ID is required" });
        return;
      }

      if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        res.status(400).json({ success: false, message: "Valid month in YYYY-MM format is required" });
        return;
      }

      const currentMonth = getCurrentMonthString();
      if (month > currentMonth) {
        res.status(400).json({
          success: false,
          message: `Future months cannot be selected or recorded. Current month is ${currentMonth}.`,
        });
        return;
      }

      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        res.status(400).json({ success: false, message: "Amount must be a valid non-negative number" });
        return;
      }

      // Ensure customer exists
      const customer = await Customer.findById(customerId);
      if (!customer) {
        res.status(404).json({ success: false, message: "Customer not found" });
        return;
      }

      const status: "PAID" | "PENDING" =
        paymentStatus === "PAID" || paymentStatus === "paid" ? "PAID" : "PENDING";

      let finalPaidAmount = 0;
      let finalPendingAmount = 0;

      if (status === "PAID") {
        finalPaidAmount = numericAmount;
        finalPendingAmount = 0;
      } else {
        const customPaid = Number(paidAmount);
        finalPaidAmount = !isNaN(customPaid) && customPaid > 0 ? customPaid : 0;
        finalPendingAmount = Math.max(0, numericAmount - finalPaidAmount);
      }

      // Check for existing record for customer + month
      const existing = await MonthlyEntry.findOne({ customerId, month });

      if (existing) {
        existing.amount = numericAmount;
        existing.paymentStatus = status;
        existing.paidAmount = finalPaidAmount;
        existing.pendingAmount = finalPendingAmount;
        if (remarks !== undefined) existing.remarks = remarks;
        await existing.save();

        res.json({
          success: true,
          isExisting: true,
          message: `${month} entry updated successfully`,
          data: existing,
        });
        return;
      }

      const newEntry = await MonthlyEntry.create({
        customerId,
        month,
        amount: numericAmount,
        paymentStatus: status,
        paidAmount: finalPaidAmount,
        pendingAmount: finalPendingAmount,
        remarks: remarks || "",
      });

      res.status(201).json({
        success: true,
        isExisting: false,
        message: `${month} entry created successfully`,
        data: newEntry,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/monthly-entries/customer/:customerId - Payment history
  static async getCustomerEntries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId } = req.params;
      const customer = await Customer.findById(customerId);
      if (!customer) {
        res.status(404).json({ success: false, message: "Customer not found" });
        return;
      }

      const entries = await MonthlyEntry.find({ customerId }).sort({ month: -1 });
      const currentMonth = getCurrentMonthString();

      const enriched = entries.map((entry) => ({
        _id: entry._id,
        customerId: entry.customerId,
        month: entry.month,
        amount: entry.amount,
        paidAmount: entry.paidAmount,
        pendingAmount: entry.pendingAmount,
        paymentStatus: entry.paymentStatus,
        remarks: entry.remarks,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        isCurrentMonth: entry.month === currentMonth,
        isPastPending: entry.month < currentMonth && entry.paymentStatus === "PENDING",
      }));

      res.json({
        success: true,
        customer: {
          _id: customer._id,
          name: customer.name,
          mobile: customer.mobile,
          status: customer.status,
        },
        currentMonth,
        count: enriched.length,
        data: enriched,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/monthly-entries/customer/:customerId/month/:month
  static async getSingleMonthEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, month } = req.params;
      const entry = await MonthlyEntry.findOne({ customerId, month });
      res.json({
        success: true,
        data: entry || null,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/monthly-entries/:id
  static async deleteEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await MonthlyEntry.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Monthly entry not found" });
        return;
      }
      res.json({ success: true, message: "Monthly entry deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
