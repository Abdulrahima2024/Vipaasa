import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { getDashboardStats } from "./report.controller";

const router = Router();

// GET /reports/dashboard - Fetch dashboard reports and analytics (Admin only)
router.get("/reports/dashboard", authenticate, authorize(["SUPER_ADMIN"]), getDashboardStats);

export default router;
