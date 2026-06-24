import { prisma } from "../../config/database";
import { AppError } from "../../shared/middleware/errorHandler";

/**
 * Retrieves the profile information of the authenticated user.
 * Returns only the user's name and email to avoid leaking sensitive fields like passwordHash or roles.
 */
export async function getProfileInfo(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const email = user.email;
  const firstName = user.profile?.firstName || "";
  const lastName = user.profile?.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Customer";

  return `Here is your profile information:\nName: ${fullName}\nEmail: ${email}`;
}
