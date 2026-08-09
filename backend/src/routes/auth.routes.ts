import { Router } from "express";
import { login, register, getMe, triggerSeed } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/login", login as any);
router.post("/register", register as any);
router.get("/seed", triggerSeed as any);

// Protected routes
router.get("/me", authenticate as any, getMe as any);

export default router;

