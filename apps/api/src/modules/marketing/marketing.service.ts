import { prisma } from "../../config/database";

export async function createDeal(data: {
  title: string;
  description?: string;
  imageUrl: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  status: string;
  priority: number;
  productIds: string[];
}) {
  return prisma.deal.create({
    data
  });
}

export async function updateDeal(id: string, data: any) {
  return prisma.deal.update({
    where: { id },
    data
  });
}

export async function deleteDeal(id: string) {
  return prisma.deal.delete({
    where: { id }
  });
}

export async function getAllDeals() {
  return prisma.deal.findMany({
    orderBy: [
      { status: "asc" },
      { priority: "desc" }
    ]
  });
}

export async function getActiveDeals() {
  const now = new Date();
  return prisma.deal.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now }
    },
    orderBy: { priority: "desc" }
  });
}
