import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import challanRoutes from "./routes/challan.routes";
import { prisma } from "./config/db";
import { seedDatabase } from "./seed";

process.on("uncaughtException", (err) => {
  console.error("FATAL UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("FATAL UNHANDLED REJECTION:", reason);
});

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FundRooms ERP API is running",
  });
});

// Seed DB Endpoint for quick manual triggering in production
app.get("/api/seed", async (req, res) => {
  try {
    const results = await seedDatabase();
    res.json({
      success: true,
      message: "Database seed completed successfully",
      data: results,
    });
  } catch (error: any) {
    console.error("Seed endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Database seed failed",
      error: error.message || String(error),
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/challans", challanRoutes);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Auto-check and seed initial users if database is empty
  try {
    const count = await prisma.user.count();
    console.log(`Database connected. Current user count: ${count}`);
    if (count === 0) {
      console.log("No users found. Running automatic seed...");
      await seedDatabase();
    }
  } catch (err) {
    console.error("Auto-seed error details:", err);
  }
});