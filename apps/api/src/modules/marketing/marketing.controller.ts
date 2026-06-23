import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as marketingService from "./marketing.service";

export async function createDeal(req: AuthenticatedRequest, res: Response) {
  try {
    const data = req.body;
    const deal = await marketingService.createDeal({
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      discountPercentage: data.discountPercentage,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status || "ACTIVE",
      priority: parseInt(data.priority) || 0,
      productIds: data.productIds || []
    });
    return res.status(201).json({ status: "success", data: deal });
  } catch (error: any) {
    console.error("CreateDeal error:", error);
    return res.status(400).json({ error: error.message || "Failed to create deal" });
  }
}

export async function updateDeal(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.priority !== undefined) updateData.priority = parseInt(data.priority);

    const deal = await marketingService.updateDeal(id, updateData);
    return res.status(200).json({ status: "success", data: deal });
  } catch (error: any) {
    console.error("UpdateDeal error:", error);
    return res.status(400).json({ error: error.message || "Failed to update deal" });
  }
}

export async function deleteDeal(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await marketingService.deleteDeal(id);
    return res.status(200).json({ status: "success", message: "Deal deleted" });
  } catch (error: any) {
    console.error("DeleteDeal error:", error);
    return res.status(500).json({ error: "Failed to delete deal" });
  }
}

export async function getAllDeals(req: AuthenticatedRequest, res: Response) {
  try {
    const deals = await marketingService.getAllDeals();
    return res.status(200).json({ status: "success", data: deals });
  } catch (error) {
    console.error("GetAllDeals error:", error);
    return res.status(500).json({ error: "Failed to fetch deals" });
  }
}

export async function getActiveDeals(req: AuthenticatedRequest, res: Response) {
  try {
    const deals = await marketingService.getActiveDeals();
    return res.status(200).json({ status: "success", data: deals });
  } catch (error) {
    console.error("GetActiveDeals error:", error);
    return res.status(500).json({ error: "Failed to fetch active deals" });
  }
}
