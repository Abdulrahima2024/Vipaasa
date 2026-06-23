import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as couponService from "./coupon.service";

export async function createCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const data = req.body;
    const coupon = await couponService.createCoupon({
      code: data.code.toUpperCase(),
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount || 0,
      maxDiscount: data.maxDiscount || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      usageLimit: data.usageLimit || null,
      perUserLimit: data.perUserLimit || 1,
      status: data.status || "ACTIVE"
    });
    return res.status(201).json({ status: "success", data: coupon });
  } catch (error: any) {
    console.error("CreateCoupon error:", error);
    return res.status(400).json({ error: error.message || "Failed to create coupon" });
  }
}

export async function updateCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    const updateData: any = { ...data };
    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const coupon = await couponService.updateCoupon(id, updateData);
    return res.status(200).json({ status: "success", data: coupon });
  } catch (error: any) {
    console.error("UpdateCoupon error:", error);
    return res.status(400).json({ error: error.message || "Failed to update coupon" });
  }
}

export async function deleteCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await couponService.deleteCoupon(id);
    return res.status(200).json({ status: "success", message: "Coupon deleted" });
  } catch (error: any) {
    console.error("DeleteCoupon error:", error);
    return res.status(500).json({ error: "Failed to delete coupon" });
  }
}

export async function getAllCoupons(req: AuthenticatedRequest, res: Response) {
  try {
    const coupons = await couponService.getAllCoupons();
    return res.status(200).json({ status: "success", data: coupons });
  } catch (error) {
    console.error("GetAllCoupons error:", error);
    return res.status(500).json({ error: "Failed to fetch coupons" });
  }
}

export async function validateCoupon(req: AuthenticatedRequest, res: Response) {
  try {
    const { code, orderAmount } = req.body;
    const userId = req.user?.id;
    
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!code || !orderAmount) return res.status(400).json({ error: "Coupon code and order amount are required" });

    const result = await couponService.validateCoupon(code, userId, orderAmount);
    return res.status(200).json({ status: "success", data: result });
  } catch (error: any) {
    console.error("ValidateCoupon error:", error);
    return res.status(400).json({ error: error.message || "Failed to validate coupon" });
  }
}
