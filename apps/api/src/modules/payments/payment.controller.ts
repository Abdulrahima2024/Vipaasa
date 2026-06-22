import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as paymentService from "./payment.service";

export async function getPayments(req: AuthenticatedRequest, res: Response) {
  try {
    const items = await paymentService.getPayments();
    return res.status(200).json(items);
  } catch (error: any) {
    console.error("GetPayments controller error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
