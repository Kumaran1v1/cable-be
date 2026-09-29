"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const router = (0, express_1.Router)();
// Routes for Customers (supports with or without auth token)
router.post("/", customer_controller_1.CustomerController.createCustomer);
router.get("/", customer_controller_1.CustomerController.getCustomers);
router.get("/:id", customer_controller_1.CustomerController.getCustomerById);
router.put("/:id", customer_controller_1.CustomerController.updateCustomer);
router.delete("/:id", customer_controller_1.CustomerController.deleteCustomer);
exports.default = router;
