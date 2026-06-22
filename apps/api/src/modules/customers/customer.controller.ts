import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as customerService from "./customer.service";

export async function listCustomers(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await customerService.getAdminCustomers(page, limit);
    return res.status(200).json(result);
  } catch (error) {
    console.error("listCustomers error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCustomerDetail(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const customer = await customerService.getAdminCustomerDetails(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    return res.status(200).json({ data: customer });
  } catch (error) {
    console.error("getCustomerDetail error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
