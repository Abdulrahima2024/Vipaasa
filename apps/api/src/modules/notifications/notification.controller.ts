import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as notificationService from "./notification.service";

export async function createCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    const data = req.body;
    const campaign = await notificationService.createCampaign({
      title: data.title,
      message: data.message,
      imageUrl: data.imageUrl,
      type: data.type || "Announcement",
      targetAudience: data.targetAudience || "All Users",
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      status: "PENDING"
    });
    return res.status(201).json({ status: "success", data: campaign });
  } catch (error: any) {
    console.error("CreateCampaign error:", error);
    return res.status(400).json({ error: error.message || "Failed to create campaign" });
  }
}

export async function getAllCampaigns(req: AuthenticatedRequest, res: Response) {
  try {
    const campaigns = await notificationService.getAllCampaigns();
    return res.status(200).json({ status: "success", data: campaigns });
  } catch (error) {
    console.error("GetAllCampaigns error:", error);
    return res.status(500).json({ error: "Failed to fetch campaigns" });
  }
}

export async function sendCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const campaign = await notificationService.sendCampaign(id);
    return res.status(200).json({ status: "success", data: campaign });
  } catch (error: any) {
    console.error("SendCampaign error:", error);
    return res.status(400).json({ error: error.message || "Failed to send campaign" });
  }
}

export async function getUserNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const notifications = await notificationService.getUserNotifications(userId);
    return res.status(200).json({ status: "success", data: notifications });
  } catch (error) {
    console.error("GetUserNotifications error:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await notificationService.markAsRead(userId, id);
    return res.status(200).json({ status: "success", message: "Marked as read" });
  } catch (error) {
    console.error("MarkAsRead error:", error);
    return res.status(500).json({ error: "Failed to mark as read" });
  }
}
