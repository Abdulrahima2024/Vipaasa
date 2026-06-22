import { PrismaClient } from "@prisma/client";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../../shared/utils/cloudinary";
import { getIO } from "../../socket/socket.server";

const prisma = new PrismaClient();

export const organicService = {
  async getAllOrganics() {
    return prisma.organic.findMany({
      include: {
        images: true
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async createOrganic(data: { name: string; description?: string; price: number; isActive?: boolean }, file?: Express.Multer.File) {
    let cloudinaryResult: { url: string; publicId: string } | null = null;
    
    if (file) {
      cloudinaryResult = await uploadImageToCloudinary(file.buffer, "vipaasa-organics");
    }

    const organic = await prisma.organic.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        isActive: data.isActive,
        images: cloudinaryResult ? {
          create: [{
            url: cloudinaryResult.url,
            publicId: cloudinaryResult.publicId
          }]
        } : undefined
      },
      include: {
        images: true
      }
    });

    // Emit websocket event
    getIO().emit("organicCreated", organic);

    return organic;
  },

  async updateOrganic(id: string, data: { name?: string; description?: string; price?: number; isActive?: boolean }, file?: Express.Multer.File) {
    const existing = await prisma.organic.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existing) {
      throw new Error("Organic product not found");
    }

    let newImageResult: { url: string; publicId: string } | null = null;

    if (file) {
      // Delete old image from Cloudinary if it exists
      if (existing.images.length > 0) {
        for (const img of existing.images) {
          try {
            await deleteImageFromCloudinary(img.publicId);
          } catch (e) {
            console.error("Failed to delete old image", e);
          }
        }
        // Delete image records from DB
        await prisma.organicImage.deleteMany({
          where: { organicId: id }
        });
      }

      // Upload new image
      newImageResult = await uploadImageToCloudinary(file.buffer, "vipaasa-organics");
    }

    const updated = await prisma.organic.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(newImageResult && {
          images: {
            create: [{
              url: newImageResult.url,
              publicId: newImageResult.publicId
            }]
          }
        })
      },
      include: {
        images: true
      }
    });

    // Emit websocket event
    getIO().emit("organicUpdated", updated);

    return updated;
  },

  async deleteOrganic(id: string) {
    const existing = await prisma.organic.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existing) {
      throw new Error("Organic product not found");
    }

    // Delete assets from Cloudinary
    for (const img of existing.images) {
      try {
        await deleteImageFromCloudinary(img.publicId);
      } catch (e) {
        console.error("Failed to delete Cloudinary asset during organic deletion", e);
      }
    }

    await prisma.organic.delete({
      where: { id }
    });

    // Emit websocket event
    getIO().emit("organicDeleted", { id });

    return { success: true };
  }
};
