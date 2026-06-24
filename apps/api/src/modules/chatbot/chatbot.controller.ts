import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as chatbotService from "./chatbot.service";
import * as historyService from "./history.service";
import { AppError } from "../../shared/middleware/errorHandler";
import { z } from "zod";

export const ChatbotMessageSchema = z.object({
  message: z
    .string({ message: "Message must be a string" })
    .min(1, "Message cannot be empty")
    .max(1000, "Message is too long (maximum 1000 characters)"),
});

/**
 * POST /chatbot/message
 * Processes a user message, detects intent, updates chat history, and returns the response.
 */
export async function handleMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    // Input Validation using Zod
    const parsed = ChatbotMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { message } = parsed.data;

    // Process intent and construct reply
    const result = await chatbotService.processMessage(userId, message);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /chatbot/history
 * Returns the chronological message history for the authenticated user.
 */
export async function handleGetHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const history = await historyService.getHistory(userId);
    return res.status(200).json(history);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /chatbot/history
 * Clears all chat history records (sessions and messages) for the authenticated user.
 */
export async function handleDeleteHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    await historyService.clearHistory(userId);
    return res.status(200).json({
      status: "success",
      message: "Chat history cleared successfully.",
    });
  } catch (error) {
    next(error);
  }
}
