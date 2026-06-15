import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { getProfile, updateProfile, changePassword, getRewards, getEcoImpact } from "./user.controller";

const router = Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);
router.get("/rewards", authenticate, getRewards);
router.get("/eco-impact", authenticate, getEcoImpact);

export default router;
