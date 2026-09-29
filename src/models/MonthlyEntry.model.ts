import { Schema, model, Document, Types } from "mongoose";

export interface IMonthlyEntry {
  customerId: Types.ObjectId;
  month: string; // format YYYY-MM e.g. "2026-09"
  amount: number;
  paymentStatus: "PAID" | "PENDING";
  paidAmount: number;
  pendingAmount: number;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMonthlyEntryDocument extends IMonthlyEntry, Document {
  _id: Types.ObjectId;
}

const monthlyEntrySchema = new Schema<IMonthlyEntryDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    collection: "monthly_entries",
  }
);

// Compound Unique Index: One Entry Per Customer Per Month
monthlyEntrySchema.index({ customerId: 1, month: 1 }, { unique: true });

export const MonthlyEntry = model<IMonthlyEntryDocument>("MonthlyEntry", monthlyEntrySchema);
export default MonthlyEntry;
