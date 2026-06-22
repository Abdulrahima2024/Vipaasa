import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as settingsService from "./settings.service";

export async function getSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const settings = await settingsService.getSettings();
    return res.status(200).json(settings);
  } catch (error: any) {
    console.error("GetSettings controller error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const { emailNotifications, smsNotifications, productAlerts } = req.body;
    
    const result = await settingsService.updateSettings({
      emailNotifications: emailNotifications !== undefined ? !!emailNotifications : undefined,
      smsNotifications: smsNotifications !== undefined ? !!smsNotifications : undefined,
      productAlerts: productAlerts !== undefined ? !!productAlerts : undefined,
    });

    return res.status(200).json({
      status: "success",
      message: "Settings updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("UpdateSettings controller error:", error);
    return res.status(400).json({ error: error.message || "Bad request" });
  }
}
