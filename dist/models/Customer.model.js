"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const mongoose_1 = require("mongoose");
const customerSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    collection: "customers",
});
customerSchema.index({ mobile: 1 }, { unique: true });
exports.Customer = (0, mongoose_1.model)("Customer", customerSchema);
exports.default = exports.Customer;
