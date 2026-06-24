export type IntentType = "ORDER_STATUS" | "ORDER_HISTORY" | "CART_SUMMARY" | "PROFILE" | "FAQ";

/**
 * Detects the intent of a user message using keyword and regex rule patterns.
 * Falls back to FAQ if no specific database actions are matched.
 */
export function detectIntent(message: string): IntentType {
  const normalized = message.trim().toLowerCase();

  // Pattern lists for each intent
  const orderStatusPatterns = [
    /where is my order/i,
    /track my order/i,
    /order status/i,
    /track order/i,
    /latest order/i,
    /delivery status/i,
    /where is order/i
  ];

  const orderHistoryPatterns = [
    /show my orders/i,
    /recent orders/i,
    /order history/i,
    /my orders/i,
    /all orders/i,
    /past orders/i,
    /previous orders/i
  ];

  const cartSummaryPatterns = [
    /my cart/i,
    /cart summary/i,
    /view cart/i,
    /show cart/i,
    /what is in my cart/i,
    /cart items/i
  ];

  const profilePatterns = [
    /my profile/i,
    /account details/i,
    /profile information/i,
    /user details/i,
    /my info/i,
    /about me/i,
    /who am i/i
  ];

  if (orderStatusPatterns.some(pattern => pattern.test(normalized))) {
    return "ORDER_STATUS";
  }
  if (orderHistoryPatterns.some(pattern => pattern.test(normalized))) {
    return "ORDER_HISTORY";
  }
  if (cartSummaryPatterns.some(pattern => pattern.test(normalized))) {
    return "CART_SUMMARY";
  }
  if (profilePatterns.some(pattern => pattern.test(normalized))) {
    return "PROFILE";
  }

  return "FAQ";
}
