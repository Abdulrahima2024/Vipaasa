import { prisma } from "../../config/database";

/**
 * Saves a chatbot message (user or assistant) to the database.
 * If the user does not have an active chat session, a new one is created.
 */
export async function saveMessage(
  userId: string,
  role: "user" | "assistant",
  message: string
) {
  // Find the latest chat session for this user
  let session = await prisma.chatSession.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // If no session exists, create a new one
  if (!session) {
    session = await prisma.chatSession.create({
      data: { userId },
    });
  } else {
    // Touch the session to update its updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });
  }

  // Create the chat message linked to this session
  return prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      role,
      message,
    },
  });
}

/**
 * Retrieves the full chronological chat message history for a user.
 */
export async function getHistory(userId: string) {
  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Flatten messages across all sessions of the user in ascending order of creation
  return sessions.flatMap((s) => s.messages);
}

/**
 * Deletes all chat sessions and messages for a user.
 * Cascades to automatically delete messages.
 */
export async function clearHistory(userId: string): Promise<void> {
  await prisma.chatSession.deleteMany({
    where: { userId },
  });
}
