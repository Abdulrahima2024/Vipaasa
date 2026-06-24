import { getCart } from "../cart/cart.service";

/**
 * Retrieves the cart summary for a user.
 * Reuses the existing cart service to load the cart and then computes total items and value.
 */
export async function getCartSummary(userId: string): Promise<string> {
  const cart = await getCart(userId);

  if (!cart.items || cart.items.length === 0) {
    return "Your cart is empty.";
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.totalAmount;

  return `You have ${totalItems} item${totalItems === 1 ? "" : "s"} in your cart worth ₹${cartTotal}.`;
}
