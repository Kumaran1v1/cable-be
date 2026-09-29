import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Routes for Customers (supports with or without auth token)
router.post("/", CustomerController.createCustomer);
router.get("/", CustomerController.getCustomers);
router.get("/:id", CustomerController.getCustomerById);
router.put("/:id", CustomerController.updateCustomer);
router.delete("/:id", CustomerController.deleteCustomer);

export default router;
