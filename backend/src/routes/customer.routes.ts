import { Router } from "express";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  addFollowUp,
} from "../controllers/customer.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// Everyone can view customers
router.get("/", getCustomers as any);
router.get("/:id", getCustomer as any);

// Admin, Sales, Accounts can create/edit customers
router.post(
  "/",
  authorize("ADMIN", "SALES", "ACCOUNTS") as any,
  createCustomer as any
);
router.put(
  "/:id",
  authorize("ADMIN", "SALES", "ACCOUNTS") as any,
  updateCustomer as any
);
router.post(
  "/:id/follow-up",
  authorize("ADMIN", "SALES", "ACCOUNTS") as any,
  addFollowUp as any
);

export default router;
