import { prisma } from "../../config/database";

export async function getWeeklyAnalytics() {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.count({
    where: { createdAt: { gte: oneWeekAgo } }
  });

  const revenueResult = await prisma.order.aggregate({
    _sum: { totalPayable: true },
    where: { createdAt: { gte: oneWeekAgo }, paymentStatus: "PAID" }
  });

  const newCustomers = await prisma.user.count({
    where: { createdAt: { gte: oneWeekAgo }, role: { name: "Customer" } }
  });

  return {
    ordersThisWeek: orders,
    revenueThisWeek: revenueResult._sum.totalPayable || 0,
    newCustomersThisWeek: newCustomers
  };
}

export async function getMonthlyAnalytics() {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.count({
    where: { createdAt: { gte: oneMonthAgo } }
  });

  const revenueResult = await prisma.order.aggregate({
    _sum: { totalPayable: true },
    where: { createdAt: { gte: oneMonthAgo }, paymentStatus: "PAID" }
  });

  const avgOrderValue = orders > 0 ? (Number(revenueResult._sum.totalPayable) || 0) / orders : 0;

  return {
    ordersThisMonth: orders,
    revenueThisMonth: revenueResult._sum.totalPayable || 0,
    averageOrderValue: avgOrderValue.toFixed(2)
  };
}

export async function getProductAnalytics() {
  // Group by variantId to get top selling variants
  const topVariants = await prisma.orderItem.groupBy({
    by: ['variantId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5
  });

  const variantIds = topVariants.map(v => v.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true }
  });

  const result = topVariants.map(v => {
    const variant = variants.find(varnt => varnt.id === v.variantId);
    return {
      productId: variant?.productId || "",
      name: variant ? `${variant.product.name} (${variant.name})` : "Unknown Product",
      quantitySold: v._sum?.quantity || 0
    };
  });

  const outOfStock = await prisma.productVariant.count({
    where: { skuStatus: "OUT_OF_STOCK" }
  });

  return { topSellingProducts: result, outOfStockProducts: outOfStock };
}

export async function getCustomerAnalytics() {
  const totalCustomers = await prisma.user.count({ where: { role: { name: "Customer" } } });
  
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newCustomers = await prisma.user.count({
    where: { createdAt: { gte: oneMonthAgo }, role: { name: "Customer" } }
  });

  return {
    totalCustomers,
    newCustomersThisMonth: newCustomers,
  };
}
