"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyEntry = void 0;
const mongoose_1 = require("mongoose");
const monthlyEntrySchema = new mongoose_1.Schema({
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Customer",
        required: [true, "Customer ID is required"],
        index: true,
    },
    month: {
        type: String,
        required: [true, "Month is required in YYYY-MM format"],
        trim: true,
        match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format"],
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount must be greater than or equal to 0"],
    },
    paymentStatus: {
        type: String,
        enum: ["PAID", "PENDING"],
        default: "PENDING",
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: [0, "Paid amount cannot be negative"],
    },
    pendingAmount: {
        type: Number,
        default: 0,
        min: [0, "Pending amount cannot be negative"],
    },
    remarks: {
        type: String,
        trim: true,
        default: "",
    },
}, {
    timestamps: true,
    collection: "monthly_entries",
});
// Compound Unique Index: One Entry Per Customer Per Month
monthlyEntrySchema.index({ customerId: 1, month: 1 }, { unique: true });
exports.MonthlyEntry = (0, mongoose_1.model)("MonthlyEntry", monthlyEntrySchema);
exports.default = exports.MonthlyEntry;
