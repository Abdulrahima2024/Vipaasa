import { prisma } from "../../config/database";

export async function getAdminCustomers(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;

  // Find system role IDs to exclude them from the customer list
  const adminRoles = await prisma.role.findMany({
    where: {
      name: { in: ['SUPER_ADMIN', 'ADMIN', 'STORE_EXECUTIVE'] }
    }
  });
  const adminRoleIds = adminRoles.map(r => r.id);

  const whereClause = {
    isDeleted: false,
    roleId: { notIn: adminRoleIds }
  };

  const total = await prisma.user.count({ where: whereClause });

  const users = await prisma.user.findMany({
    where: whereClause,
    skip,
    take: limit,
    include: {
      profile: {
        include: { addresses: true }
      },
      orders: {
        where: {
          status: { notIn: ["CANCELLED", "RETURNED"] }
        },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const formattedCustomers = users.map(user => {
    const defaultAddress = user.profile?.addresses.find(a => a.isDefault) || user.profile?.addresses[0];
    const totalSpent = user.orders.reduce((acc, order) => acc + Number(order.totalPayable || 0), 0);
    
    let addressStr = "N/A";
    if (defaultAddress) {
      addressStr = `${defaultAddress.addressLine1}, ${defaultAddress.city}, ${defaultAddress.state}, ${defaultAddress.postalCode}`;
    }

    return {
      id: user.id,
      name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : "Customer User",
      email: user.email,
      phone: user.phoneNumber || null,
      status: user.status === "ACTIVE" ? "Active" : "Inactive",
      ordersCount: user.orders.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      joinedDate: user.createdAt.toISOString().split("T")[0],
      shippingAddress: addressStr
    };
  });

  return {
    data: formattedCustomers,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getAdminCustomerDetails(id: string) {
  const user = await prisma.user.findUnique({
    where: { id, isDeleted: false },
    include: {
      profile: {
        include: { addresses: true }
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: true
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  const defaultAddress = user.profile?.addresses.find(a => a.isDefault) || user.profile?.addresses[0];
  const validOrders = user.orders.filter(o => o.status !== "CANCELLED" && o.status !== "RETURNED");
  const totalSpent = validOrders.reduce((acc, order) => acc + Number(order.totalPayable || 0), 0);
  
  let addressStr = "N/A";
  if (defaultAddress) {
    addressStr = `${defaultAddress.addressLine1}, ${defaultAddress.city}, ${defaultAddress.state}, ${defaultAddress.postalCode}`;
  }

  const orderHistory = user.orders.map(order => {
    let mappedStatus = "Pending";
    if (order.status === "DELIVERED") mappedStatus = "Delivered";
    else if (order.status === "SHIPPED") mappedStatus = "Shipped";
    else if (order.status === "CANCELLED") mappedStatus = "Cancelled";
    else if (order.status === "RETURNED") mappedStatus = "Returned";
    
    return {
      id: order.orderNumber || order.id,
      date: order.createdAt.toISOString().split("T")[0],
      total: Number(order.totalPayable),
      status: mappedStatus
    };
  });

  return {
    id: user.id,
    name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : "Customer User",
    email: user.email,
    phone: user.phoneNumber || null,
    status: user.status === "ACTIVE" ? "Active" : "Inactive",
    ordersCount: user.orders.length,
    totalSpent: Math.round(totalSpent * 100) / 100,
    joinedDate: user.createdAt.toISOString().split("T")[0],
    shippingAddress: addressStr,
    orderHistory
  };
}
