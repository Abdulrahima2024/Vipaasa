import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { getSettings, updateSettings } from "./settings.controller";

const router = Router();

router.get("/settings", authenticate, getSettings);
router.put("/settings", authenticate, updateSettings);

export default router;
