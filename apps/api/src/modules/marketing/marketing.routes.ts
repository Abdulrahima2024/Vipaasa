import { Router } from "express";
import * as marketingController from "./marketing.controller";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";

const router = Router();

// Public routes
router.get("/deals/active", marketingController.getActiveDeals);

// Admin routes
router.get("/admin/deals", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), marketingController.getAllDeals);
router.post("/admin/deals", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), marketingController.createDeal);
router.put("/admin/deals/:id", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), marketingController.updateDeal);
router.delete("/admin/deals/:id", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), marketingController.deleteDeal);

export default router;
