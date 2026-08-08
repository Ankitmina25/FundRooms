import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/login", login as any);

// Protected routes
router.get("/me", authenticate as any, getMe as any);

export default router;
