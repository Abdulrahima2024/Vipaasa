import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import {
  checkout,
  getOrders,
  getOrderById,
  cancelOrder,
  getAdminOrders,
  getAdminOrderStats,
  updateOrderStatus,
  assignDelivery,
  verifyDelivery,
} from "./order.controller";

const router = Router();

// Customer Checkout
router.post("/checkout", authenticate, checkout);

// Customer Orders list, details, and cancellation
router.get("/orders", authenticate, getOrders);
router.get("/orders/:id", authenticate, getOrderById);
router.patch("/orders/:id/cancel", authenticate, cancelOrder);

// Admin Orders management
router.get("/admin/orders/stats", authenticate, authorize(["SUPER_ADMIN", "STORE_EXECUTIVE", "ADMIN"]), getAdminOrderStats);
router.get("/admin/orders", authenticate, authorize(["SUPER_ADMIN", "STORE_EXECUTIVE", "ADMIN"]), getAdminOrders);
router.patch("/admin/orders/:id/status", authenticate, authorize(["SUPER_ADMIN", "STORE_EXECUTIVE", "ADMIN"]), updateOrderStatus);
router.post("/admin/orders/:id/assign-delivery", authenticate, authorize(["SUPER_ADMIN", "STORE_EXECUTIVE", "ADMIN"]), assignDelivery);
router.post("/admin/orders/:id/verify-delivery", authenticate, authorize(["SUPER_ADMIN", "STORE_EXECUTIVE", "ADMIN"]), verifyDelivery);

export default router;
