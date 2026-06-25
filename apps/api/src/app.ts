import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import productRoutes from "./modules/products/product.routes";
import reportRoutes from "./modules/reports/report.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/orders/order.routes";
import organicRoutes from "./modules/organics/organic.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import settingsRoutes from "./modules/settings/settings.routes";
import customerRoutes from "./modules/customers/customer.routes";
import deliveryPartnerRoutes from "./modules/delivery-partners/delivery-partner.routes";
import marketingRoutes from "./modules/marketing/marketing.routes";
import couponRoutes from "./modules/coupons/coupon.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import { requestLogger } from "./shared/middleware/requestLogger";
import { rateLimiter } from "./shared/middleware/rateLimiter";
import { errorHandler } from "./shared/middleware/errorHandler";
import { isOriginAllowed } from "./config/cors";

dotenv.config();

const app = express();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(requestLogger);

// Apply rate limiting to all api endpoints
app.use("/api", rateLimiter);

// Serve local uploads folder statically
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", productRoutes);
app.use("/api", reportRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", organicRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", paymentRoutes);
app.use("/api", settingsRoutes);
app.use("/api", customerRoutes);
app.use("/api/admin/delivery-partners", deliveryPartnerRoutes);
app.use("/api", marketingRoutes);
app.use("/api", couponRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", notificationRoutes);




// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
