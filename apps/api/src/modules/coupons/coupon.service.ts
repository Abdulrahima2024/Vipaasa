import { prisma } from "../../config/database";
import { AppError } from "../../shared/middleware/errorHandler";

export async function createCoupon(data: any) {
  return prisma.coupon.create({ data });
}

export async function updateCoupon(id: string, data: any) {
  return prisma.coupon.update({ where: { id }, data });
}

export async function deleteCoupon(id: string) {
  await prisma.couponUsage.deleteMany({ where: { couponId: id } });
  return prisma.coupon.delete({ where: { id } });
}

export async function getAllCoupons(page = 1, limit = 20, search?: string) {
  const where: any = {};
  
  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }

  const [data, totalCount] = await Promise.all([
    prisma.coupon.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        _count: {
          select: { usages: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.coupon.count({ where })
  ]);

  return {
    data,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  };
}

export async function validateCoupon(code: string, userId: string, orderAmount: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  
  if (!coupon) throw new AppError("Invalid coupon code", 400);
  if (coupon.status !== "ACTIVE") throw new AppError("Coupon is not active", 400);
  
  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    throw new AppError("Coupon has expired or is not yet active", 400);
  }

  if (Number(orderAmount) < Number(coupon.minOrderAmount)) {
    throw new AppError(`Minimum order amount must be ₹${coupon.minOrderAmount}`, 400);
  }

  if (coupon.usageLimit) {
    const totalUsage = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
    if (totalUsage >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit reached", 400);
    }
  }

  const userUsage = await prisma.couponUsage.count({
    where: { couponId: coupon.id, userId }
  });

  if (userUsage >= coupon.perUserLimit) {
    throw new AppError("You have already reached the usage limit for this coupon", 400);
  }

  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (orderAmount * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
      discountAmount = Number(coupon.maxDiscount);
    }
  } else {
    discountAmount = Number(coupon.discountValue);
  }

  return {
    coupon,
    discountAmount,
    finalAmount: orderAmount - discountAmount
  };
}
