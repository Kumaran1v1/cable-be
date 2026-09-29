"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = void 0;
const Customer_model_1 = __importDefault(require("../models/Customer.model"));
const MonthlyEntry_model_1 = __importDefault(require("../models/MonthlyEntry.model"));
const MONTH_NAMES = [
    { num: "01", short: "Jan", name: "January" },
    { num: "02", short: "Feb", name: "February" },
    { num: "03", short: "Mar", name: "March" },
    { num: "04", short: "Apr", name: "April" },
    { num: "05", short: "May", name: "May" },
    { num: "06", short: "Jun", name: "June" },
    { num: "07", short: "Jul", name: "July" },
    { num: "08", short: "Aug", name: "August" },
    { num: "09", short: "Sep", name: "September" },
    { num: "10", short: "Oct", name: "October" },
    { num: "11", short: "Nov", name: "November" },
    { num: "12", short: "Dec", name: "December" },
];
const getDashboardSummary = async (req, res) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear().toString();
        const currentMonthNum = String(now.getMonth() + 1).padStart(2, "0");
        const defaultMonth = `${currentYear}-${currentMonthNum}`;
        const targetYear = req.query.year || currentYear;
        const targetMonth = req.query.month || defaultMonth;
        // 1. Total Active Customers Count & List
        const activeCustomers = await Customer_model_1.default.find({ status: "active" })
            .select("_id name mobile")
            .sort({ name: 1 })
            .lean();
        const customerCount = activeCustomers.length;
        // 2. Current Month Entries
        const currentMonthEntries = await MonthlyEntry_model_1.default.find({ month: targetMonth }).lean();
        const entryByCustId = new Map();
        let currentMonthCollection = 0;
        let currentMonthPendingAmount = 0;
        let paidCustomersCount = 0;
        currentMonthEntries.forEach((entry) => {
            const cId = entry.customerId.toString();
            entryByCustId.set(cId, entry);
            if (entry.paymentStatus === "PAID") {
                currentMonthCollection += entry.amount || 0;
                paidCustomersCount += 1;
            }
            else {
                currentMonthPendingAmount += entry.amount || 0;
            }
        });
        // 3. This Month Not Paid Count & Unpaid List
        const thisMonthNotPaidCount = Math.max(0, customerCount - paidCustomersCount);
        const unpaidCustomers = activeCustomers
            .filter((c) => {
            const entry = entryByCustId.get(c._id.toString());
            return !entry || entry.paymentStatus !== "PAID";
        })
            .map((c) => {
            const entry = entryByCustId.get(c._id.toString());
            return {
                _id: c._id.toString(),
                name: c.name,
                mobile: c.mobile,
                status: entry ? entry.paymentStatus : "UNPAID",
                amount: entry ? entry.amount : 0,
                existingEntry: entry || null,
            };
        });
        // 4. One Year Total Collection (Jan - Dec for targetYear)
        const yearStartMonth = `${targetYear}-01`;
        const yearEndMonth = `${targetYear}-12`;
        const yearEntries = await MonthlyEntry_model_1.default.find({
            month: { $gte: yearStartMonth, $lte: yearEndMonth },
        }).lean();
        let oneYearCollection = 0;
        let oneYearPendingAmount = 0;
        // 12-Month breakdown
        const monthStatsMap = {};
        MONTH_NAMES.forEach((m) => {
            monthStatsMap[`${targetYear}-${m.num}`] = {
                collected: 0,
                pending: 0,
                paidCount: 0,
                pendingCount: 0,
            };
        });
        yearEntries.forEach((entry) => {
            const mKey = entry.month;
            if (entry.paymentStatus === "PAID") {
                oneYearCollection += entry.amount || 0;
                if (monthStatsMap[mKey]) {
                    monthStatsMap[mKey].collected += entry.amount || 0;
                    monthStatsMap[mKey].paidCount += 1;
                }
            }
            else {
                oneYearPendingAmount += entry.amount || 0;
                if (monthStatsMap[mKey]) {
                    monthStatsMap[mKey].pending += entry.amount || 0;
                    monthStatsMap[mKey].pendingCount += 1;
                }
            }
        });
        const monthlyOverview = MONTH_NAMES.map((m) => {
            const mKey = `${targetYear}-${m.num}`;
            const stats = monthStatsMap[mKey] || { collected: 0, pending: 0, paidCount: 0, pendingCount: 0 };
            return {
                month: mKey,
                short: m.short,
                name: m.name,
                collected: stats.collected,
                pending: stats.pending,
                paidCount: stats.paidCount,
                pendingCount: stats.pendingCount,
            };
        });
        res.json({
            success: true,
            data: {
                year: targetYear,
                month: targetMonth,
                customerCount,
                currentMonthCollection,
                currentMonthPendingAmount,
                thisMonthNotPaidCount,
                paidCustomersCount,
                oneYearCollection,
                oneYearPendingAmount,
                monthlyOverview,
                unpaidCustomers,
            },
        });
    }
    catch (error) {
        console.error("Dashboard summary error:", error);
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to fetch dashboard summary",
        });
    }
};
exports.getDashboardSummary = getDashboardSummary;
