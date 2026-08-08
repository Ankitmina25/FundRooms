import { Router } from "express";
import {
  getChallans,
  getChallan,
  createChallan,
  updateChallanStatus,
} from "../controllers/challan.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// Everyone can view challans
router.get("/", getChallans as any);
router.get("/:id", getChallan as any);

// Admin, Sales, Accounts can create challans and update status
router.post(
  "/",
  authorize("ADMIN", "SALES", "ACCOUNTS") as any,
  createChallan as any
);
router.put(
  "/:id/status",
  authorize("ADMIN", "SALES", "ACCOUNTS") as any,
  updateChallanStatus as any
);

export default router;
