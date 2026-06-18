import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "./cart.controller";

const router = Router();

// Retrieve authenticated user's cart (automatically created if non-existent)
router.get("/cart", authenticate, getCart);

// Add item to cart (automatically increments quantity if duplicate, checks inventory)
router.post("/cart/items", authenticate, addToCart);

// Update quantity of a specific cart item after verifying ownership and stock
router.put("/cart/items/:id", authenticate, updateCartItemQuantity);

// Remove specific item from cart after verifying ownership
router.delete("/cart/items/:id", authenticate, removeCartItem);

// Clear all items in user's cart
router.delete("/cart", authenticate, clearCart);

export default router;
