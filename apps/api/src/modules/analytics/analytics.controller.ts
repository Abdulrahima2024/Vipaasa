import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as analyticsService from "./analytics.service";

export async function getWeeklyAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const data = await analyticsService.getWeeklyAnalytics();
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("getWeeklyAnalytics error:", error);
    return res.status(500).json({ error: "Failed to fetch weekly analytics" });
  }
}

export async function getMonthlyAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const data = await analyticsService.getMonthlyAnalytics();
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("getMonthlyAnalytics error:", error);
    return res.status(500).json({ error: "Failed to fetch monthly analytics" });
  }
}

export async function getProductAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const data = await analyticsService.getProductAnalytics();
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("getProductAnalytics error:", error);
    return res.status(500).json({ error: "Failed to fetch product analytics" });
  }
}

export async function getCustomerAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const data = await analyticsService.getCustomerAnalytics();
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("getCustomerAnalytics error:", error);
    return res.status(500).json({ error: "Failed to fetch customer analytics" });
  }
}
