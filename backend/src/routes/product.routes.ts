import { Router } from "express";
import {
  getProducts,
  getProduct,
  getLowStockProducts,
  createProduct,
  updateProduct,
  addStockMovement,
} from "../controllers/product.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// Everyone can view products
router.get("/", getProducts as any);
router.get("/low-stock", getLowStockProducts as any);
router.get("/:id", getProduct as any);

// Admin, Warehouse can create/edit products and manage stock
router.post(
  "/",
  authorize("ADMIN", "WAREHOUSE") as any,
  createProduct as any
);
router.put(
  "/:id",
  authorize("ADMIN", "WAREHOUSE") as any,
  updateProduct as any
);
router.post(
  "/:id/stock",
  authorize("ADMIN", "WAREHOUSE") as any,
  addStockMovement as any
);

export default router;
