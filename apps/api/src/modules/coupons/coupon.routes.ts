import { Router } from "express";
import * as couponController from "./coupon.controller";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";

const router = Router();

// Public / User routes
router.post("/coupons/validate", authenticate, couponController.validateCoupon);

// Admin routes
router.get("/admin/coupons", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), couponController.getAllCoupons);
router.post("/admin/coupons", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), couponController.createCoupon);
router.put("/admin/coupons/:id", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), couponController.updateCoupon);
router.delete("/admin/coupons/:id", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), couponController.deleteCoupon);

export default router;
