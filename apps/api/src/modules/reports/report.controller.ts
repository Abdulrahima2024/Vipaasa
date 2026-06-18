import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const filter = (req.query.filter as string) || "month";

    // 1. Calculate startDate based on filter
    const now = new Date();
    let startDate = new Date();
    if (filter === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (filter === "week") {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // month
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    // 2. Fetch KPIs
    // Total Orders
    const totalOrdersCount = await prisma.order.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Today's Orders count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrdersCount = await prisma.order.count({
      where: {
        createdAt: { gte: startOfToday },
      },
    });

    // Total Revenue (excluding CANCELLED and RETURNED orders)
    const revenueSumResult = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ["CANCELLED", "RETURNED"] },
      },
      _sum: {
        totalPayable: true,
      },
    });
    const totalRevenue = Number(revenueSumResult._sum.totalPayable || 0);

    // Pending Deliveries (order status in PENDING, CONFIRMED, PROCESSING, SHIPPED)
    const pendingDeliveriesCount = await prisma.order.count({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
      },
    });

    // 3. Order status breakdown
    const ordersInPeriod = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        status: true,
        totalPayable: true,
        createdAt: true,
      },
    });

    let delivered = 0;
    let pending = 0;
    let cancelled = 0;
    let returned = 0;

    ordersInPeriod.forEach((o) => {
      const statusUpper = o.status.toUpperCase();
      if (statusUpper === "DELIVERED") {
        delivered++;
      } else if (statusUpper === "CANCELLED") {
        cancelled++;
      } else if (statusUpper === "RETURNED" || statusUpper === "REFUNDED") {
        returned++;
      } else {
        pending++;
      }
    });

    // 4. Best Sellers
    const bestSellersGroup = await prisma.orderItem.groupBy({
      by: ["variantId"],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { notIn: ["CANCELLED", "RETURNED"] },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const bestSellers = [];
    for (const item of bestSellersGroup) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: {
            select: { name: true },
          },
        },
      });
      if (variant) {
        bestSellers.push({
          name: variant.product.name + (variant.name ? ` (${variant.name})` : ""),
          sold: item._sum.quantity || 0,
          max: 100,
        });
      }
    }

    const maxSold = bestSellers.length > 0 ? Math.max(...bestSellers.map((b) => b.sold)) : 100;
    bestSellers.forEach((b) => {
      b.max = Math.max(maxSold, 10);
    });

    // 5. Customer Statistics
    const customerRole = await prisma.role.findFirst({
      where: { name: "CUSTOMER" },
    });
    
    const totalCustomers = await prisma.user.count({
      where: {
        roleId: customerRole?.id,
        isDeleted: false,
      },
    });

    const activeCustomers = await prisma.user.count({
      where: {
        roleId: customerRole?.id,
        status: "ACTIVE",
        isDeleted: false,
      },
    });

    const activeRate = totalCustomers > 0 ? `${((activeCustomers / totalCustomers) * 100).toFixed(1)}%` : "0%";

    const newCustomers = await prisma.user.count({
      where: {
        roleId: customerRole?.id,
        createdAt: { gte: startDate },
        isDeleted: false,
      },
    });
    const priorCustomers = totalCustomers - newCustomers;
    const growthTrend = priorCustomers > 0 ? `+${((newCustomers / priorCustomers) * 100).toFixed(1)}%` : "+0.0%";

    // 6. Recent Orders (limit to 5)
    const recentOrdersFromDb = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    const recentOrders = recentOrdersFromDb.map((order) => {
      const customerName = order.user?.profile
        ? `${order.user.profile.firstName} ${order.user.profile.lastName || ""}`.trim()
        : order.user?.email || "Guest Customer";

      const initials = order.user?.profile
        ? ((order.user.profile.firstName?.[0] || "") + (order.user.profile.lastName?.[0] || "")).toUpperCase()
        : "GC";

      return {
        id: order.orderNumber || `#${order.id.slice(0, 8)}`,
        customer: customerName,
        initials,
        color: "bg-green-100 text-green-700",
        date: order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        total: `₹${Number(order.totalPayable).toLocaleString("en-IN")}`,
        status: order.status,
        statusColor:
          order.status === "DELIVERED"
            ? "bg-green-100 text-green-700"
            : order.status === "CANCELLED"
              ? "bg-red-100 text-red-700"
              : order.status === "RETURNED"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-700",
      };
    });

    // 7. Low Stock items
    const lowStockInventories = await prisma.inventory.findMany({
      where: {
        quantityOnHand: {
          lte: 15,
        },
        warehouse: {
          isActive: true,
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      take: 10,
    });

    const lowStockItems = lowStockInventories.map((inv) => ({
      id: inv.id,
      name: inv.variant.product.name + (inv.variant.name ? ` (${inv.variant.name})` : ""),
      sku: inv.variant.sku,
      currentStock: inv.quantityOnHand,
      minStock: inv.reorderLevel,
    }));

    // 8. Revenue Chart Data
    let labels: string[] = [];
    let values: number[] = [];
    let amounts: string[] = [];

    // Filter order items that are valid
    const validOrders = ordersInPeriod.filter((o) => o.status !== "CANCELLED" && o.status !== "RETURNED");

    if (filter === "today") {
      labels = ["9AM", "12PM", "3PM", "6PM", "9PM"];
      // Initialise empty slots
      const slotSums = [0, 0, 0, 0, 0];
      validOrders.forEach((o) => {
        const hour = o.createdAt.getHours();
        if (hour < 10) {
          slotSums[0] += Number(o.totalPayable); // 9AM slot
        } else if (hour < 13) {
          slotSums[1] += Number(o.totalPayable); // 12PM slot
        } else if (hour < 16) {
          slotSums[2] += Number(o.totalPayable); // 3PM slot
        } else if (hour < 19) {
          slotSums[3] += Number(o.totalPayable); // 6PM slot
        } else {
          slotSums[4] += Number(o.totalPayable); // 9PM slot
        }
      });
      values = slotSums;
      amounts = slotSums.map((val) => `₹${(val / 1000).toFixed(1)}k`);
    } else if (filter === "week") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = dayNames[d.getDay()];
        labels.push(dayLabel);

        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);

        const dailyOrders = validOrders.filter((o) => o.createdAt >= start && o.createdAt <= end);
        const dailyRevenue = dailyOrders.reduce((sum, o) => sum + Number(o.totalPayable), 0);
        values.push(dailyRevenue);
        amounts.push(`₹${(dailyRevenue / 1000).toFixed(1)}k`);
      }
    } else {
      // month - last 30 days divided into 5 groups of 6 days
      labels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"];
      for (let i = 0; i < 5; i++) {
        const start = new Date();
        start.setDate(start.getDate() - (5 - i) * 6);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setDate(end.getDate() - (4 - i) * 6);
        end.setHours(23, 59, 59, 999);

        const weeklyOrders = validOrders.filter((o) => o.createdAt >= start && o.createdAt <= end);
        const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + Number(o.totalPayable), 0);
        values.push(weeklyRevenue);
        amounts.push(`₹${(weeklyRevenue / 1000).toFixed(0)}k`);
      }
    }

    const maxChartValue = values.length > 0 ? Math.max(...values) : 100;

    res.status(200).json({
      filter,
      kpis: {
        totalOrders: totalOrdersCount,
        todayOrders: filter === "today" 
          ? String(todayOrdersCount) 
          : filter === "week"
            ? `${(totalOrdersCount / 7).toFixed(1)} (avg)`
            : `${(totalOrdersCount / 30).toFixed(1)} (avg)`,
        revenue: `₹${totalRevenue.toLocaleString("en-IN")}`,
        pendingDeliveries: pendingDeliveriesCount,
      },
      customerStats: {
        totalCustomers,
        activeRate,
        growthTrend,
        satisfactionScore: "4.85 / 5.0",
      },
      orderStatusPie: {
        delivered,
        pending,
        cancelled,
        returned,
      },
      bestSellers,
      recentOrders,
      lowStockItems,
      revenueChart: {
        labels,
        values,
        amounts,
        maxValue: Math.max(maxChartValue, 100),
        title: filter === "today" 
          ? "Today's Revenue Trend" 
          : filter === "week" 
            ? "Weekly Revenue Trend" 
            : "Monthly Revenue Trend",
        subtext: filter === "today" 
          ? "Hourly sales analysis" 
          : filter === "week" 
            ? "Daily sales analysis" 
            : "Weekly aggregated sales",
        totalRevenue: `₹${(totalRevenue / 1000).toFixed(1)}k`,
      },
    });
  } catch (error) {
    console.error("Error generating dashboard stats:", error);
    res.status(500).json({ error: "Failed to generate dashboard statistics" });
  }
}
