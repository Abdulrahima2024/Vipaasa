import { prisma } from "../../config/database";

export async function createCampaign(data: any) {
  return prisma.notification.create({ data });
}

export async function getAllCampaigns() {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function sendCampaign(campaignId: string) {
  const campaign = await prisma.notification.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status === "SENT") throw new Error("Campaign already sent");

  let users: any[] = [];
  
  if (campaign.targetAudience === "All Users") {
    users = await prisma.user.findMany({ select: { id: true } });
  } else if (campaign.targetAudience === "Premium Customers") {
    // For simplicity, just send to some
    users = await prisma.user.findMany({ select: { id: true } });
  } else {
    users = await prisma.user.findMany({ select: { id: true } });
  }

  // Create user notifications
  const userNotifications = users.map(user => ({
    userId: user.id,
    notificationId: campaign.id
  }));

  if (userNotifications.length > 0) {
    await prisma.userNotification.createMany({
      data: userNotifications
    });
  }

  return prisma.notification.update({
    where: { id: campaignId },
    data: { status: "SENT" }
  });
}

export async function getUserNotifications(userId: string) {
  return prisma.userNotification.findMany({
    where: { userId },
    include: { notification: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function markAsRead(userId: string, notificationId: string) {
  return prisma.userNotification.updateMany({
    where: { userId, id: notificationId },
    data: { isRead: true, readAt: new Date() }
  });
}
