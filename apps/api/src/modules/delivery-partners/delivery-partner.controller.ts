import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as deliveryPartnerService from "./delivery-partner.service";

export async function getAllPartners(req: AuthenticatedRequest, res: Response) {
  try {
    const partners = await deliveryPartnerService.getAllDeliveryPartners();
    
    // Map to response format
    const mappedPartners = partners.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      vehicleNumber: p.vehicleNumber,
      vehicleType: p.vehicleType,
      status: p.status,
      completedDeliveries: p._count.assignments,
      assignedOrders: p.assignments.length
    }));

    return res.status(200).json({ status: "success", data: mappedPartners });
  } catch (error) {
    console.error("GetAllPartners error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAvailablePartners(req: AuthenticatedRequest, res: Response) {
  try {
    const partners = await deliveryPartnerService.getAvailablePartners();
    return res.status(200).json({ status: "success", data: partners });
  } catch (error) {
    console.error("GetAvailablePartners error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createPartner(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, phone, email, vehicleNumber, vehicleType, licenseNumber } = req.body;
    if (!name || !phone || !vehicleNumber || !vehicleType || !licenseNumber) {
      return res.status(400).json({ error: "All fields except email are required" });
    }

    const partner = await deliveryPartnerService.createDeliveryPartner({ name, phone, email, vehicleNumber, vehicleType, licenseNumber });
    return res.status(201).json({ status: "success", data: partner });
  } catch (error: any) {
    console.error("CreatePartner error:", error);
    return res.status(400).json({ error: error.message || "Failed to create partner" });
  }
}

export async function getPartnerById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const partner = await deliveryPartnerService.getDeliveryPartnerById(id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    return res.status(200).json({ status: "success", data: partner });
  } catch (error) {
    console.error("GetPartnerById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updatePartnerStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await deliveryPartnerService.updateDeliveryPartnerStatus(id, status);
    return res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    console.error("UpdatePartnerStatus error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updatePartner(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, phone, email, vehicleNumber, vehicleType, licenseNumber, status } = req.body;
    const updated = await deliveryPartnerService.updateDeliveryPartner(id, { name, phone, email, vehicleNumber, vehicleType, licenseNumber, status });
    return res.status(200).json({ status: "success", data: updated });
  } catch (error: any) {
    console.error("UpdatePartner error:", error);
    return res.status(400).json({ error: error.message || "Failed to update partner" });
  }
}

export async function deactivatePartner(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await deliveryPartnerService.deactivateDeliveryPartner(id);
    return res.status(200).json({ status: "success", message: "Partner deactivated" });
  } catch (error) {
    console.error("DeactivatePartner error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
