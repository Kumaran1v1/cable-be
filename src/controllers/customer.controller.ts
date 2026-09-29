import { Request, Response, NextFunction } from "express";
import Customer from "../models/Customer.model";
import MonthlyEntry from "../models/MonthlyEntry.model";

export class CustomerController {
  // POST /api/customers - Create Customer
  static async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, mobile, status } = req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        res.status(400).json({
          success: false,
          message: "Customer name is required",
        });
        return;
      }

      const cleanMobile = (mobile || "").toString().trim();
      if (!cleanMobile) {
        res.status(400).json({
          success: false,
          message: "Mobile number is required",
        });
        return;
      }

      if (!/^\d{10}$/.test(cleanMobile)) {
        res.status(400).json({
          success: false,
          message: "Mobile number must be numbers only and exactly 10 digits",
        });
        return;
      }

      // Check if mobile already exists
      const existing = await Customer.findOne({ mobile: cleanMobile });
      if (existing) {
        res.status(400).json({
          success: false,
          message: `Existing mobile number cannot be added again. Already registered for customer "${existing.name}".`,
        });
        return;
      }

      const customer = await Customer.create({
        name: name.trim(),
        mobile: cleanMobile,
        status: status || "active",
      });

      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/customers - Get Customer List with optional month data
  static async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { month, year, search } = req.query as { month?: string; year?: string; search?: string };

      const query: any = {};
      if (search && search.trim()) {
        const s = search.trim();
        query.$or = [
          { name: { $regex: s, $options: "i" } },
          { mobile: { $regex: s, $options: "i" } },
        ];
      }

      const customers = await Customer.find(query).sort({ createdAt: 1 });
      const customerIds = customers.map((c) => c._id);

      // 1. If year is provided: return 12-month grid data for each customer
      if (year && /^\d{4}$/.test(year)) {
        const entries = await MonthlyEntry.find({
          customerId: { $in: customerIds },
          month: { $regex: new RegExp(`^${year}-`) },
        });

        // Key by `${customerId}_${month}`
        const entryMap = new Map<string, any>();
        entries.forEach((e) => {
          entryMap.set(`${e.customerId.toString()}_${e.month}`, {
            _id: e._id,
            month: e.month,
            amount: e.amount,
            paidAmount: e.paidAmount,
            pendingAmount: e.pendingAmount,
            paymentStatus: e.paymentStatus,
          });
        });

        // Month summary counters across all customers
        const monthSummaries: Record<string, { totalAmount: number; totalPaid: number; totalPending: number }> = {};
        for (let m = 1; m <= 12; m++) {
          const mStr = `${year}-${String(m).padStart(2, "0")}`;
          monthSummaries[mStr] = { totalAmount: 0, totalPaid: 0, totalPending: 0 };
        }

        entries.forEach((e) => {
          if (monthSummaries[e.month]) {
            monthSummaries[e.month].totalAmount += e.amount;
            if (e.paymentStatus === "PAID") {
              monthSummaries[e.month].totalPaid += e.amount;
            } else {
              monthSummaries[e.month].totalPending += e.amount;
            }
          }
        });

        const gridCustomers = customers.map((c) => {
          const cId = c._id.toString();
          const customerMonthlyEntries: Record<string, any> = {};

          for (let m = 1; m <= 12; m++) {
            const mStr = `${year}-${String(m).padStart(2, "0")}`;
            customerMonthlyEntries[mStr] = entryMap.get(`${cId}_${mStr}`) || null;
          }

          return {
            _id: c._id,
            name: c.name,
            mobile: c.mobile,
            status: c.status,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            entries: customerMonthlyEntries,
          };
        });

        res.json({
          success: true,
          count: gridCustomers.length,
          year,
          monthSummaries,
          data: gridCustomers,
        });
        return;
      }

      if (!month) {
        res.json({
          success: true,
          count: customers.length,
          data: customers,
        });
        return;
      }

      // Fetch entries for the selected month for all matching customers
      const entries = await MonthlyEntry.find({
        customerId: { $in: customerIds },
        month: month,
      });

      // Map entries by customerId string
      const entryMap = new Map<string, any>();
      entries.forEach((e) => {
        entryMap.set(e.customerId.toString(), e);
      });

      // Also check if any customer has unpaid/pending entries prior to this month
      const pastPendingEntries = await MonthlyEntry.find({
        customerId: { $in: customerIds },
        month: { $lt: month },
        paymentStatus: "PENDING",
      });

      const pastPendingMap = new Map<string, number>();
      pastPendingEntries.forEach((p) => {
        const idStr = p.customerId.toString();
        pastPendingMap.set(idStr, (pastPendingMap.get(idStr) || 0) + (p.pendingAmount || p.amount));
      });

      const enrichedCustomers = customers.map((c) => {
        const cId = c._id.toString();
        const currentEntry = entryMap.get(cId) || null;
        const pastPendingTotal = pastPendingMap.get(cId) || 0;

        return {
          _id: c._id,
          name: c.name,
          mobile: c.mobile,
          status: c.status,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          monthlyEntry: currentEntry
            ? {
                _id: currentEntry._id,
                month: currentEntry.month,
                amount: currentEntry.amount,
                paidAmount: currentEntry.paidAmount,
                pendingAmount: currentEntry.pendingAmount,
                paymentStatus: currentEntry.paymentStatus,
              }
            : null,
          hasPreviousPending: pastPendingTotal > 0,
          previousPendingTotal: pastPendingTotal,
        };
      });

      res.json({
        success: true,
        count: enrichedCustomers.length,
        month,
        data: enrichedCustomers,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/customers/:id
  static async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        res.status(404).json({ success: false, message: "Customer not found" });
        return;
      }
      res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/customers/:id
  static async updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, mobile, status } = req.body;
      const cleanMobile = mobile ? mobile.toString().trim() : undefined;

      if (cleanMobile && !/^\d{10}$/.test(cleanMobile)) {
        res.status(400).json({
          success: false,
          message: "Mobile number must be exactly 10 digits",
        });
        return;
      }

      if (cleanMobile) {
        const existing = await Customer.findOne({
          mobile: cleanMobile,
          _id: { $ne: req.params.id },
        });
        if (existing) {
          res.status(400).json({
            success: false,
            message: "Mobile number already in use by another customer",
          });
          return;
        }
      }

      const updateData: any = {};
      if (name) updateData.name = name.trim();
      if (cleanMobile) updateData.mobile = cleanMobile;
      if (status) updateData.status = status;

      const updated = await Customer.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        res.status(404).json({ success: false, message: "Customer not found" });
        return;
      }

      res.json({ success: true, message: "Customer updated", data: updated });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/customers/:id
  static async deleteCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);
      if (!customer) {
        res.status(404).json({ success: false, message: "Customer not found" });
        return;
      }
      // Also delete all associated monthly entries
      await MonthlyEntry.deleteMany({ customerId: req.params.id });

      res.json({ success: true, message: "Customer and records deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
