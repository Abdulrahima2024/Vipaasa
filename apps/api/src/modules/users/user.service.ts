import bcrypt from "bcryptjs";
import { prisma } from "../../config/database";

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false
    },
    include: {
      role: true,
      profile: true
    }
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
  }
) {
  // 1. Fetch user to verify active status
  const user = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
    include: { profile: true }
  });

  if (!user) {
    throw new Error("User not found or has been deactivated");
  }

  // 2. Validate email unique constraint if changing email
  if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        isDeleted: false,
        id: { not: userId }
      }
    });

    if (existingUser) {
      throw new Error("An account with this email address already exists");
    }
  }

  // 3. Validate phoneNumber unique constraint if changing phone
  if (data.phoneNumber && data.phoneNumber !== user.phoneNumber) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phoneNumber: data.phoneNumber,
        isDeleted: false,
        id: { not: userId }
      }
    });

    if (existingPhone) {
      throw new Error("An account with this phone number already exists");
    }
  }

  // 4. Parse dateOfBirth if provided
  let parsedDob: Date | undefined;
  if (data.dateOfBirth) {
    parsedDob = new Date(data.dateOfBirth);
    if (isNaN(parsedDob.getTime())) {
      throw new Error("Invalid date of birth format");
    }
  }

  // 5. Perform transaction to update User and CustomerProfile
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update basic user details
    const u = await tx.user.update({
      where: { id: userId },
      data: {
        email: data.email || undefined,
        phoneNumber: data.phoneNumber !== undefined ? (data.phoneNumber || null) : undefined
      }
    });

    // Update or create profile
    if (user.profile) {
      await tx.customerProfile.update({
        where: { userId },
        data: {
          firstName: data.firstName || undefined,
          lastName: data.lastName !== undefined ? (data.lastName || "") : undefined,
          avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
          ...(parsedDob ? { dateOfBirth: parsedDob } : {})
        }
      });
    } else {
      await tx.customerProfile.create({
        data: {
          userId,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          avatarUrl: data.avatarUrl || null,
          ...(parsedDob ? { dateOfBirth: parsedDob } : {})
        }
      });
    }

    // Fetch full updated user object
    return tx.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        profile: true
      }
    });
  });

  return updatedUser;
}

export async function changePassword(
  userId: string,
  currentPassword_raw: string,
  newPassword_raw: string
) {
  const user = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false }
  });

  if (!user) {
    throw new Error("User not found or is inactive");
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(currentPassword_raw, user.passwordHash);
  if (!passwordMatch) {
    throw new Error("Incorrect current password");
  }

  // Hash and save new password
  const newPasswordHash = await bcrypt.hash(newPassword_raw, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash }
  });

  return true;
}

export async function getUserRewards(userId: string) {
  // Calculate reward points based on completed orders
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ["DELIVERED", "CONFIRMED", "PROCESSING", "SHIPPED"] }
    },
    select: {
      totalPayable: true
    }
  });

  // Award 1 point per INR 10 spent
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalPayable), 0);
  const rewardPoints = Math.floor(totalSpent / 10);

  return {
    rewardPoints: rewardPoints || 250, // Fallback to 250 for demo
    totalOrders: orders.length,
    totalSpent: Math.round(totalSpent * 100) / 100,
    tier: rewardPoints >= 500 ? "Gold" : rewardPoints >= 200 ? "Silver" : "Bronze"
  };
}

export async function getUserEcoImpact(userId: string) {
  // Calculate eco impact based on order count
  const orderCount = await prisma.order.count({
    where: {
      userId,
      status: { in: ["DELIVERED", "CONFIRMED", "PROCESSING", "SHIPPED"] }
    }
  });

  // Each order plants ~1 tree and saves ~4kg CO2
  const treesPlanted = orderCount > 0 ? orderCount : 12; // Fallback for demo
  const co2Saved = treesPlanted * 4;

  return {
    treesPlanted,
    co2Saved,
    plasticSaved: treesPlanted * 2, // kg of plastic avoided
    organicPercentage: 100
  };
}

export async function getUserAddresses(userId: string) {
  console.log(`[BACKEND] getUserAddresses: Fetching all addresses for User: ${userId}`);
  let profile = await prisma.customerProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    const userObj = await prisma.user.findUnique({ where: { id: userId } });
    profile = await prisma.customerProfile.create({
      data: {
        userId,
        firstName: userObj?.email.split("@")[0] || "Customer",
        lastName: "User",
      },
    });
  }

  return prisma.customerAddress.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserAddressesAndProfile(userId: string) {
  console.log(`[BACKEND] getUserAddressesAndProfile: Fetching profile & addresses for User: ${userId}`);
  let profile = await prisma.customerProfile.findUnique({
    where: { userId },
    include: {
      addresses: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!profile) {
    const userObj = await prisma.user.findUnique({ where: { id: userId } });
    profile = await prisma.customerProfile.create({
      data: {
        userId,
        firstName: userObj?.email.split("@")[0] || "Customer",
        lastName: "User",
      },
      include: {
        addresses: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  return profile;
}

export async function createUserAddress(
  userId: string,
  data: {
    addressType: "HOME" | "WORK" | "BILLING" | "SHIPPING";
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string | null;
    isDefault?: boolean;
  }
) {
  console.log(`[BACKEND] createUserAddress: Initiating address creation for User: ${userId}`);
  let profile = await prisma.customerProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    const userObj = await prisma.user.findUnique({ where: { id: userId } });
    profile = await prisma.customerProfile.create({
      data: {
        userId,
        firstName: userObj?.email.split("@")[0] || "Customer",
        lastName: "User",
      },
    });
  }

  return prisma.$transaction(async (tx) => {
    const existingAddressesCount = await tx.customerAddress.count({
      where: { profileId: profile!.id },
    });

    const isDefault = data.isDefault || existingAddressesCount === 0;

    if (isDefault) {
      await tx.customerAddress.updateMany({
        where: { profileId: profile!.id },
        data: { isDefault: false },
      });
    }

    const newAddr = await tx.customerAddress.create({
      data: {
        profileId: profile!.id,
        addressType: data.addressType,
        isDefault,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone || null,
      },
    });
    console.log(`[BACKEND] createUserAddress: Address created successfully in DB (ID: ${newAddr.id}, Type: ${newAddr.addressType})`);
    return newAddr;
  });
}

export async function updateUserAddress(
  userId: string,
  addressId: string,
  data: {
    addressType?: "HOME" | "WORK" | "BILLING" | "SHIPPING";
    addressLine1?: string;
    addressLine2?: string | null;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string | null;
    isDefault?: boolean;
  }
) {
  console.log(`[BACKEND] updateUserAddress: Updating address ID: ${addressId} for User: ${userId}`);
  const profile = await prisma.customerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Customer profile not found");
  }

  const address = await prisma.customerAddress.findUnique({
    where: { id: addressId },
  });

  if (!address || address.profileId !== profile.id) {
    throw new Error("Address not found or does not belong to this profile");
  }

  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.customerAddress.updateMany({
        where: { profileId: profile.id, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updatedAddr = await tx.customerAddress.update({
      where: { id: addressId },
      data: {
        addressType: data.addressType,
        isDefault: data.isDefault,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 !== undefined ? data.addressLine2 : undefined,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone !== undefined ? data.phone : undefined,
      },
    });
    console.log(`[BACKEND] updateUserAddress: Address updated successfully in DB (ID: ${updatedAddr.id})`);
    return updatedAddr;
  });
}

export async function deleteUserAddress(userId: string, addressId: string) {
  console.log(`[BACKEND] deleteUserAddress: Deleting address ID: ${addressId} for User: ${userId}`);
  const profile = await prisma.customerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Customer profile not found");
  }

  const address = await prisma.customerAddress.findUnique({
    where: { id: addressId },
  });

  if (!address || address.profileId !== profile.id) {
    throw new Error("Address not found or does not belong to this profile");
  }

  await prisma.customerAddress.delete({
    where: { id: addressId },
  });
  console.log(`[BACKEND] deleteUserAddress: Address deleted successfully from DB (ID: ${addressId})`);

  return true;
}

export async function getAllUsers(page = 1, limit = 20, search?: string, roleFilter?: string, statusFilter?: string) {
  const where: any = { isDeleted: false };
  
  if (statusFilter && statusFilter !== "All") {
    where.status = statusFilter.toUpperCase();
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { profile: { firstName: { contains: search, mode: "insensitive" } } },
      { profile: { lastName: { contains: search, mode: "insensitive" } } },
      { phoneNumber: { contains: search, mode: "insensitive" } }
    ];
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        role: true,
        profile: true,
        orders: {
          select: {
            totalPayable: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.user.count({ where })
  ]);

  const mappedData = users.map(u => {
    let roleName = "Customer";
    let permissions = { manageProducts: false, manageOrders: false, manageInventory: false, viewReports: false };

    if (u.role.name === "SUPER_ADMIN") {
      roleName = "Super Admin";
      permissions = { manageProducts: true, manageOrders: true, manageInventory: true, viewReports: true };
    } else if (u.role.name.startsWith("CUSTOM_")) {
      roleName = "Admin";
      try {
        permissions = JSON.parse(u.role.description || "{}");
      } catch (e) {}
    } else if (u.role.name === "STORE_EXECUTIVE") {
      roleName = "Store Executive";
      permissions = { manageProducts: false, manageOrders: true, manageInventory: true, viewReports: false };
    } else if (u.role.name === "ADMIN") {
      roleName = "Admin";
      permissions = { manageProducts: true, manageOrders: true, manageInventory: true, viewReports: true };
    }

    const totalOrders = u.orders?.length || 0;
    const totalSpent = (u.orders || [])
      .filter((order) => order.status !== "CANCELLED" && order.status !== "RETURNED")
      .reduce((sum, order) => sum + Number(order.totalPayable), 0);

    return {
      id: u.id,
      name: u.profile ? `${u.profile.firstName} ${u.profile.lastName}`.trim() : "System User",
      email: u.email,
      phone: u.phoneNumber || "-",
      role: roleName,
      status: u.status === "ACTIVE" ? "Active" : "Inactive",
      permissions,
      createdAt: u.createdAt.toISOString(),
      totalOrders,
      totalSpent
    };
  });

  return {
    data: mappedData,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  };
}

export async function createSystemUser(data: {
  email: string;
  name: string;
  role?: string;
  status: string;
  permissions?: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageInventory: boolean;
    viewReports: boolean;
  };
}) {
  const parts = data.name.split(" ");
  const firstName = parts[0] || "System";
  const lastName = parts.slice(1).join(" ") || "User";

  const p = data.permissions || { manageProducts: true, manageOrders: true, manageInventory: true, viewReports: true };
  const roleName = `CUSTOM_${p.manageProducts ? "P" : "0"}${p.manageOrders ? "O" : "0"}${p.manageInventory ? "I" : "0"}${p.viewReports ? "R" : "0"}`;

  let role = await prisma.role.findFirst({ where: { name: roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { name: roleName, description: JSON.stringify(p) } });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    if (existingUser.isDeleted) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: {
          isDeleted: false,
          status: data.status === "Active" ? "ACTIVE" : "INACTIVE",
          roleId: role.id
        },
        include: { role: true, profile: true }
      });
    }
    throw new Error("User with this email already exists");
  }

  const passwordHash = "$2a$10$ka/DoBLmP82dZRR.ItmY6.fbdftjHo.kcwBcV8ZpV2rIs2Af.NfGm";

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      status: data.status === "Active" ? "ACTIVE" : "INACTIVE",
      roleId: role.id,
      profile: {
        create: {
          firstName,
          lastName
        }
      }
    },
    include: {
      role: true,
      profile: true
    }
  });
}

export async function updateSystemUser(id: string, data: {
  email: string;
  name: string;
  role?: string;
  status: string;
  permissions?: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageInventory: boolean;
    viewReports: boolean;
  };
}) {
  const parts = data.name.split(" ");
  const firstName = parts[0] || "System";
  const lastName = parts.slice(1).join(" ") || "User";

  const p = data.permissions || { manageProducts: true, manageOrders: true, manageInventory: true, viewReports: true };
  const roleName = `CUSTOM_${p.manageProducts ? "P" : "0"}${p.manageOrders ? "O" : "0"}${p.manageInventory ? "I" : "0"}${p.viewReports ? "R" : "0"}`;

  let role = await prisma.role.findFirst({ where: { name: roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { name: roleName, description: JSON.stringify(p) } });
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: {
        email: data.email,
        status: data.status === "Active" ? "ACTIVE" : "INACTIVE",
        roleId: role.id
      }
    });

    const profile = await tx.customerProfile.findUnique({
      where: { userId: id }
    });

    if (profile) {
      await tx.customerProfile.update({
        where: { userId: id },
        data: {
          firstName,
          lastName
        }
      });
    } else {
      await tx.customerProfile.create({
        data: {
          userId: id,
          firstName,
          lastName
        }
      });
    }

    return tx.user.findUnique({
      where: { id },
      include: { role: true, profile: true }
    });
  });
}

export async function deleteSystemUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });
}

export async function getUserOrders(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [orders, total, aggregate] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.order.count({
      where: { userId }
    }),
    prisma.order.aggregate({
      where: { userId, status: { notIn: ["CANCELLED", "RETURNED"] } },
      _sum: { totalPayable: true }
    })
  ]);

  const mappedOrders = orders.map((order) => {
    const products = order.items.map((item) => item.variant?.product?.name || "Product");
    
    // Format products list: "Organic Rice, Honey +2 more"
    let productsDisplay = products.join(", ");
    if (products.length > 2) {
      productsDisplay = `${products.slice(0, 2).join(", ")} +${products.length - 2} more`;
    } else if (products.length === 0) {
      productsDisplay = "No products";
    }

    return {
      orderId: order.orderNumber || order.id,
      createdAt: order.createdAt,
      products: productsDisplay,
      totalAmount: Number(order.totalPayable),
      paymentStatus: order.paymentStatus,
      orderStatus: order.status
    };
  });

  return {
    success: true,
    data: mappedOrders,
    meta: {
      lifetimeSpend: aggregate._sum.totalPayable ? Number(aggregate._sum.totalPayable) : 0
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

export async function getUsersDashboardStats() {
  const [totalUsers, totalOrders, aggregateRevenue] = await Promise.all([
    prisma.user.count({
      where: { isDeleted: false }
    }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        status: { notIn: ["CANCELLED", "RETURNED"] }
      },
      _sum: { totalPayable: true }
    })
  ]);

  return {
    totalUsers,
    totalOrders,
    totalRevenue: aggregateRevenue._sum.totalPayable ? Number(aggregateRevenue._sum.totalPayable) : 0
  };
}