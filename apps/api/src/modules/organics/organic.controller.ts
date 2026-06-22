import { Request, Response } from "express";
import { organicService } from "./organic.service";

export const organicController = {
  async getAll(req: Request, res: Response) {
    try {
      const organics = await organicService.getAllOrganics();
      res.status(200).json({ success: true, data: organics });
    } catch (error: any) {
      console.error("[OrganicController getAll]", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, description, price, isActive } = req.body;
      const file = req.file;

      if (!name || !price) {
        return res.status(400).json({ success: false, message: "Name and price are required." });
      }

      const organic = await organicService.createOrganic({
        name,
        description,
        price: parseFloat(price),
        isActive: isActive === 'true' || isActive === true
      }, file);

      res.status(201).json({ success: true, data: organic });
    } catch (error: any) {
      console.error("[OrganicController create]", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, price, isActive } = req.body;
      const file = req.file;

      const organic = await organicService.updateOrganic(id, {
        name,
        description,
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true })
      }, file);

      res.status(200).json({ success: true, data: organic });
    } catch (error: any) {
      console.error("[OrganicController update]", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await organicService.deleteOrganic(id);
      res.status(200).json({ success: true, message: "Organic product deleted successfully." });
    } catch (error: any) {
      console.error("[OrganicController delete]", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
