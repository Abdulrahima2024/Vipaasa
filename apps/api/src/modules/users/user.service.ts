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
