import { Schema, model, Document, Types } from "mongoose";

export interface ICustomer {
  name: string;
  mobile: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICustomerDocument extends ICustomer, Document {
  _id: Types.ObjectId;
}

const customerSchema = new Schema<ICustomerDocument>(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "customers",
  }
);

customerSchema.index({ mobile: 1 }, { unique: true });

export const Customer = model<ICustomerDocument>("Customer", customerSchema);
export default Customer;
