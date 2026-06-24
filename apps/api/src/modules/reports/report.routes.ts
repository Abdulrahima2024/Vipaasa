import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { getDashboardStats, getAnalyticsStats } from "./report.controller";

const router = Router();

// GET /reports/dashboard - Fetch dashboard reports and analytics (Admin/Operations)
router.get("/reports/dashboard", authenticate, authorize(["SUPER_ADMIN", "STORE_EXECUTIVE", "ADMIN"]), getDashboardStats);

// GET /reports/analytics - Fetch advanced analytical reports across tabs
router.get("/reports/analytics", authenticate, getAnalyticsStats);

export default router;

