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
  // Simplistic top selling products
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5
  });

  const productIds = topProducts.map(p => p.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }});

  const result = topProducts.map(p => ({
    productId: p.productId,
    name: products.find(prod => prod.id === p.productId)?.name || "Unknown Product",
    quantitySold: p._sum.quantity
  }));

  const outOfStock = await prisma.product.count({
    where: { stockStatus: "OUT_OF_STOCK" }
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
