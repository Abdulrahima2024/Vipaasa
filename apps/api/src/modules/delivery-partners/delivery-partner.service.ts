import { prisma } from "../../config/database";

export async function getAllDeliveryPartners() {
  return prisma.deliveryPartner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { assignments: { where: { status: "DELIVERED" } } }
      },
      assignments: {
        where: { status: { in: ["ASSIGNED", "ACCEPTED"] } }
      }
    }
  });
}

export async function createDeliveryPartner(data: { name: string; phone: string; email?: string; vehicleNumber: string; vehicleType: string; licenseNumber: string }) {
  const existingPhone = await prisma.deliveryPartner.findFirst({
    where: { phone: data.phone, isActive: true }
  });
  if (existingPhone) throw new Error("A partner with this phone number already exists.");

  const existingVehicle = await prisma.deliveryPartner.findFirst({
    where: { vehicleNumber: data.vehicleNumber, isActive: true }
  });
  if (existingVehicle) throw new Error("A partner with this vehicle number already exists.");

  if (data.email) {
    const existingEmail = await prisma.deliveryPartner.findFirst({
      where: { email: data.email, isActive: true }
    });
    if (existingEmail) throw new Error("A partner with this email already exists.");
  }

  return prisma.deliveryPartner.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType,
      licenseNumber: data.licenseNumber,
      status: "AVAILABLE",
    }
  });
}

export async function getDeliveryPartnerById(id: string) {
  return prisma.deliveryPartner.findUnique({
    where: { id },
    include: {
      assignments: {
        include: { 
          order: {
            include: {
              DeliveryOTP: true
            }
          } 
        },
        orderBy: { assignedAt: "desc" }
      }
    }
  });
}

export async function updateDeliveryPartner(id: string, data: { name?: string; phone?: string; email?: string | null; vehicleNumber?: string; vehicleType?: string; licenseNumber?: string; status?: any }) {
  if (data.phone) {
    const existingPhone = await prisma.deliveryPartner.findFirst({
      where: { phone: data.phone, isActive: true, id: { not: id } }
    });
    if (existingPhone) throw new Error("A partner with this phone number already exists.");
  }

  if (data.vehicleNumber) {
    const existingVehicle = await prisma.deliveryPartner.findFirst({
      where: { vehicleNumber: data.vehicleNumber, isActive: true, id: { not: id } }
    });
    if (existingVehicle) throw new Error("A partner with this vehicle number already exists.");
  }

  if (data.email) {
    const existingEmail = await prisma.deliveryPartner.findFirst({
      where: { email: data.email, isActive: true, id: { not: id } }
    });
    if (existingEmail) throw new Error("A partner with this email already exists.");
  }

  return prisma.deliveryPartner.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType,
      licenseNumber: data.licenseNumber,
      status: data.status,
    }
  });
}

export async function updateDeliveryPartnerStatus(id: string, status: any) {
  return prisma.deliveryPartner.update({
    where: { id },
    data: { status }
  });
}

export async function deactivateDeliveryPartner(id: string) {
  return prisma.deliveryPartner.update({
    where: { id },
    data: { isActive: false, status: "OFFLINE" }
  });
}

export async function getAvailablePartners() {
  return prisma.deliveryPartner.findMany({
    where: { isActive: true, status: "AVAILABLE" },
    orderBy: { name: "asc" }
  });
}
