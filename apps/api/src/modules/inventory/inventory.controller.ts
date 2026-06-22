import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as inventoryService from "./inventory.service";

export async function getInventory(req: AuthenticatedRequest, res: Response) {
  try {
    const items = await inventoryService.getInventory();
    return res.status(200).json(items);
  } catch (error: any) {
    console.error("GetInventory controller error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function adjustStock(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { variantId, quantityChange, reason } = req.body;

    if (!variantId || quantityChange === undefined || !reason) {
      return res.status(400).json({ error: "variantId, quantityChange, and reason are required" });
    }

    const result = await inventoryService.adjustStock(userId, {
      variantId,
      quantityChange: parseInt(quantityChange, 10),
      reason,
    });

    return res.status(200).json({
      status: "success",
      message: "Stock adjusted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("AdjustStock controller error:", error);
    return res.status(400).json({ error: error.message || "Bad request" });
  }
}

export async function updateRules(req: AuthenticatedRequest, res: Response) {
  try {
    const { variantId, reorderLevel } = req.body;

    if (!variantId || reorderLevel === undefined) {
      return res.status(400).json({ error: "variantId and reorderLevel are required" });
    }

    const result = await inventoryService.updateRules(variantId, {
      reorderLevel: parseInt(reorderLevel, 10),
    });

    return res.status(200).json({
      status: "success",
      message: "Inventory rules updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("UpdateRules controller error:", error);
    return res.status(400).json({ error: error.message || "Bad request" });
  }
}
