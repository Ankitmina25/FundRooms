import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { seedDatabase } from "../seed";
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

/**
 * POST /api/auth/register
 * Register a new user with name, email, password, and role. Returns JWT token.
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    const error = validateRequired({ name, email, password, role }, ["name", "email", "password", "role"]);
    if (error) {
      res.status(400).json({ success: false, message: error });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
      return;
    }

    const validRoles = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
    const formattedRole = String(role).toUpperCase();
    if (!validRoles.includes(formattedRole)) {
      res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      res.status(400).json({ success: false, message: "User with this email already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: formattedRole as any,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/auth/seed
 * Seed all default users
 */
export const triggerSeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await seedDatabase();
    res.json({ success: true, message: "Database seeded successfully", data: results });
  } catch (error: any) {
    console.error("Trigger seed error:", error);
    res.status(500).json({ success: false, message: "Seed failed", error: error.message || String(error) });
  }
};

