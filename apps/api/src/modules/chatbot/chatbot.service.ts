import { detectIntent } from "./intent.service";
import { getFAQResponse } from "./faq.service";
import { getLatestOrderStatus, getRecentOrders } from "./order.service";
import { getCartSummary } from "./cart.service";
import { getProfileInfo } from "./profile.service";
import { saveMessage } from "./history.service";

/**
 * Processes an incoming user message, identifies the intent, executes the relevant database queries,
 * saves both the user message and assistant answer to the chat history, and returns the response payload.
 */
export async function processMessage(
  userId: string,
  message: string
): Promise<{ type: string; answer: string }> {
  // 1. Detect intent
  const intent = detectIntent(message);

  // 2. Resolve answer based on intent
  let answer = "";
  switch (intent) {
    case "ORDER_STATUS":
      answer = await getLatestOrderStatus(userId);
      break;
    case "ORDER_HISTORY":
      answer = await getRecentOrders(userId);
      break;
    case "CART_SUMMARY":
      answer = await getCartSummary(userId);
      break;
    case "PROFILE":
      answer = await getProfileInfo(userId);
      break;
    case "FAQ":
    default:
      answer = await getFAQResponse(message);
      break;
  }

  // 3. Persist the interaction in user's chat history
  await saveMessage(userId, "user", message);
  await saveMessage(userId, "assistant", answer);

  return {
    type: intent,
    answer,
  };
}
