import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { getInventory, adjustStock, updateRules } from "./inventory.controller";

const router = Router();

router.get("/inventory", authenticate, getInventory);
router.post("/inventory/adjust", authenticate, adjustStock);
router.put("/inventory/rules", authenticate, updateRules);

export default router;
