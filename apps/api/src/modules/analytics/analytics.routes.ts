import { Router } from "express";
import * as analyticsController from "./analytics.controller";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";

const router = Router();

// Admin routes
router.get("/admin/analytics/weekly", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), analyticsController.getWeeklyAnalytics);
router.get("/admin/analytics/monthly", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), analyticsController.getMonthlyAnalytics);
router.get("/admin/analytics/products", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), analyticsController.getProductAnalytics);
router.get("/admin/analytics/customers", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), analyticsController.getCustomerAnalytics);

export default router;
