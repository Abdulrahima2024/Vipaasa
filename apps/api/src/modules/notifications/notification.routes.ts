import { Router } from "express";
import * as notificationController from "./notification.controller";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";

const router = Router();

// User routes
router.get("/notifications", authenticate, notificationController.getUserNotifications);
router.put("/notifications/:id/read", authenticate, notificationController.markAsRead);

// Admin routes
router.get("/admin/notifications", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), notificationController.getAllCampaigns);
router.post("/admin/notifications", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), notificationController.createCampaign);
router.post("/admin/notifications/:id/send", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), notificationController.sendCampaign);

export default router;
