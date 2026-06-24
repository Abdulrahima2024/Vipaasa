import { prisma } from "../../config/database";

/**
 * Retrieves the latest order status for a user.
 * Enforces strict user isolation by querying only orders belonging to the authenticated userId.
 */
export async function getLatestOrderStatus(userId: string): Promise<string> {
  const order = await prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!order) {
    return "You have not placed any orders yet.";
  }

  return `Your latest order ${order.orderNumber} is ${order.status}.`;
}

/**
 * Retrieves up to 5 recent orders for a user.
 * Enforces strict user isolation by querying only orders belonging to the authenticated userId.
 */
export async function getRecentOrders(userId: string): Promise<string> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (orders.length === 0) {
    return "You have not placed any orders yet.";
  }

  const orderList = orders
    .map((o, index) => {
      const date = new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return `${index + 1}. Order ${o.orderNumber} - ₹${o.totalPayable} (Status: ${o.status}, Date: ${date})`;
    })
    .join("\n");

  return `Here are your recent orders:\n${orderList}`;
}
