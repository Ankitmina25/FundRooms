import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import challanRoutes from "./routes/challan.routes";

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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/challans", challanRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});