import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import productRoutes from "./modules/products/product.routes";
import reportRoutes from "./modules/reports/report.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/orders/order.routes";
import organicRoutes from "./modules/organics/organic.routes";
import { requestLogger } from "./shared/middleware/requestLogger";
import { rateLimiter } from "./shared/middleware/rateLimiter";
import { errorHandler } from "./shared/middleware/errorHandler";

dotenv.config();

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(requestLogger);

// Apply rate limiting to all api endpoints
app.use("/api", rateLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", productRoutes);
app.use("/api", reportRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", organicRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
