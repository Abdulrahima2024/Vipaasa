import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  getProfile,
  updateProfile,
  changePassword,
  getRewards,
  getEcoImpact,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from "./user.controller";

const router = Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);
router.get("/rewards", authenticate, getRewards);
router.get("/eco-impact", authenticate, getEcoImpact);

// Addresses management
router.get("/addresses", authenticate, getAddresses);
router.post("/addresses", authenticate, createAddress);
router.put("/addresses/:id", authenticate, updateAddress);
router.delete("/addresses/:id", authenticate, deleteAddress);

export default router;
