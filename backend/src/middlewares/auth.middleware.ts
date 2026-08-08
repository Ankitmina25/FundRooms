import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches userId and userRole to the request object.
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: number;
      role: string;
    };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Middleware: Check if user has one of the allowed roles.
 * Must be used AFTER authenticate middleware.
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
      return;
    }
    next();
  };
};
