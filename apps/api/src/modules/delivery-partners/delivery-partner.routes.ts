import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import {
  getAllPartners,
  getAvailablePartners,
  createPartner,
  getPartnerById,
  updatePartnerStatus,
  updatePartner,
  deactivatePartner
} from "./delivery-partner.controller";

const router = Router();

// Only Admins can manage delivery partners
router.use(authenticate);
router.use(authorize(["ADMIN", "SUPER_ADMIN"]));

router.get("/", getAllPartners);
router.get("/available", getAvailablePartners);
router.post("/", createPartner);
router.get("/:id", getPartnerById);
router.patch("/:id/status", updatePartnerStatus);
router.put("/:id", updatePartner);
router.delete("/:id", deactivatePartner);

export default router;
