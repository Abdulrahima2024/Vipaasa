import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import {
  checkout,
  getOrders,
  getOrderById,
  cancelOrder,
  getAdminOrders,
} from "./order.controller";

const router = Router();

// Customer Checkout
router.post("/checkout", authenticate, checkout);

// Customer Orders list, details, and cancellation
router.get("/orders", authenticate, getOrders);
router.get("/orders/:id", authenticate, getOrderById);
router.patch("/orders/:id/cancel", authenticate, cancelOrder);

// Admin Orders management
router.get("/admin/orders", authenticate, authorize(["SUPER_ADMIN"]), getAdminOrders);

export default router;

