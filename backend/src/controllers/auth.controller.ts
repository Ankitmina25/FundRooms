import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { validateRequired, validateEmail } from "../utils/validate";

/**
 * POST /api/auth/login
 * Login with email and password. Returns JWT token.
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    const error = validateRequired({ email, password }, ["email", "password"]);
    if (error) {
      res.status(400).json({ success: false, message: error });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }

    // Find user by email
    console.log(`[LOGIN ATTEMPT] Email: "${email}", Password length: ${password?.length}`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`[LOGIN FAILED] User not found for email: "${email}"`);
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN CHECK] User ID: ${user.id}, Email: "${user.email}", Password Match: ${isMatch}`);
    if (!isMatch) {
      console.log(`[LOGIN FAILED] Password mismatch for user: "${email}"`);
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/auth/me
 * Get current logged-in user profile.
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
