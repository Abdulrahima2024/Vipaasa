import { PrismaClient } from "@prisma/client";
import * as cartRepository from "./cart.repository";
import { CartResponse, CartItemResponse } from "./cart.types";
import { AppError } from "../../shared/middleware/errorHandler";

const prisma = new PrismaClient();

/**
 * Maps database Cart model and relations to dynamic CartResponse schema
 */
export function mapCartResponse(cart: any): CartResponse {
  const items: CartItemResponse[] = (cart.items || []).map((item: any) => {
    const variant = item.variant;
    const unitPrice = variant?.pricing ? Number(variant.pricing.basePrice) : 0;
    const subtotal = item.quantity * unitPrice;

    // Build standard, descriptive product name
    let productName = variant?.name || "";
    const parentName = variant?.product?.name;
    if (parentName && !productName.includes(parentName)) {
      productName = `${parentName} - ${productName}`;
    }

    return {
      productId: item.variantId,
      productName,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    cartId: cart.id,
    items,
    totalAmount: Math.round(totalAmount * 100) / 100, // round to 2 decimal places
  };
}

/**
 * Retrieves the authenticated user's cart, creating one automatically if not found.
 */
export async function getCart(userId: string): Promise<CartResponse> {
  let cart = await cartRepository.findCartByUserId(userId);
  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }
  return mapCartResponse(cart);
}

/**
 * Adds an item to the cart, automatically creating the cart if needed.
 * Merges quantities if product variant is already present, and checks inventory.
 */
export async function addToCart(userId: string, productId: string, quantity: number): Promise<CartResponse> {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch or create cart
    let cart = await cartRepository.findCartByUserId(userId, tx);
    if (!cart) {
      cart = await cartRepository.createCart(userId, tx);
    }

    // 2. Fetch variant with parent product and inventory details
    const variant = await cartRepository.getVariantWithDetails(productId, tx);
    if (!variant) {
      throw new AppError("Product variant not found", 404);
    }

    // 3. Business Rule: Product must exist, be active, and not deleted
    if (!variant.product || !variant.product.isActive || variant.product.isDeleted) {
      throw new AppError("Product is inactive or no longer available", 400);
    }

    // 4. Calculate total quantity needed to validate against inventory
    const existingItem = await cartRepository.findCartItem(cart.id, variant.id, tx);
    const newQuantity = (existingItem?.quantity || 0) + quantity;

    // 5. Business Rule: Validate available stock
    const availableStock = variant.inventories.reduce(
      (sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved),
      0
    );

    if (newQuantity > availableStock) {
      throw new AppError(
        `Cannot add quantity. Requested total is ${newQuantity}, but available stock is ${availableStock}.`,
        400
      );
    }

    // 6. Add new cart item or increment quantity
    if (existingItem) {
      await cartRepository.updateCartItemQuantity(existingItem.id, newQuantity, tx);
    } else {
      await cartRepository.createCartItem(cart.id, variant.id, quantity, tx);
    }

    // 7. Get final updated cart
    const updatedCart = await cartRepository.findCartByUserId(userId, tx);
    if (!updatedCart) {
      throw new AppError("Failed to load updated cart details", 500);
    }

    return mapCartResponse(updatedCart);
  }, {
    timeout: 15000,
  });
}

/**
 * Updates the quantity of a specific cart item after verifying ownership and inventory.
 */
export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<CartResponse> {
  return prisma.$transaction(async (tx) => {
    // 1. Verify cart item exists and retrieve cart information
    const cartItem = await cartRepository.findCartItemById(cartItemId, tx);
    if (!cartItem) {
      throw new AppError("Cart item not found", 404);
    }

    // 2. Business Rule: Verify cart item belongs to the authenticated user
    if (cartItem.cart.userId !== userId) {
      throw new AppError("Access denied. You can only modify your own cart.", 403);
    }

    // 3. Fetch variant details for inventory checks
    const variant = await cartRepository.getVariantWithDetails(cartItem.variantId, tx);
    if (!variant) {
      throw new AppError("Product variant not found", 404);
    }

    // 4. Business Rule: Product must be active and not deleted
    if (!variant.product || !variant.product.isActive || variant.product.isDeleted) {
      throw new AppError("Product is inactive or no longer available", 400);
    }

    // 5. Business Rule: Validate against available inventory
    const availableStock = variant.inventories.reduce(
      (sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved),
      0
    );

    if (quantity > availableStock) {
      throw new AppError(
        `Cannot update quantity. Requested quantity is ${quantity}, but available stock is ${availableStock}.`,
        400
      );
    }

    // 6. Update database record
    await cartRepository.updateCartItemQuantity(cartItemId, quantity, tx);

    // 7. Fetch final updated cart
    const updatedCart = await cartRepository.findCartByUserId(userId, tx);
    if (!updatedCart) {
      throw new AppError("Failed to load updated cart details", 500);
    }

    return mapCartResponse(updatedCart);
  }, {
    timeout: 15000,
  });
}

/**
 * Removes a specific cart item after verifying ownership.
 */
export async function removeCartItem(userId: string, cartItemId: string): Promise<CartResponse> {
  return prisma.$transaction(async (tx) => {
    // 1. Verify cart item exists
    const cartItem = await cartRepository.findCartItemById(cartItemId, tx);
    if (!cartItem) {
      throw new AppError("Cart item not found", 404);
    }

    // 2. Business Rule: Verify cart item belongs to the authenticated user
    if (cartItem.cart.userId !== userId) {
      throw new AppError("Access denied. You can only modify your own cart.", 403);
    }

    // 3. Delete database record
    await cartRepository.deleteCartItem(cartItemId, tx);

    // 4. Fetch final updated cart
    const updatedCart = await cartRepository.findCartByUserId(userId, tx);
    if (!updatedCart) {
      throw new AppError("Failed to load updated cart details", 500);
    }

    return mapCartResponse(updatedCart);
  }, {
    timeout: 15000,
  });
}

/**
 * Clears all items in the user's cart.
 */
export async function clearCart(userId: string): Promise<CartResponse> {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch or create cart
    let cart = await cartRepository.findCartByUserId(userId, tx);
    if (!cart) {
      cart = await cartRepository.createCart(userId, tx);
    }

    // 2. Clear items
    await cartRepository.clearCartItems(cart.id, tx);

    // 3. Fetch final updated cart
    const updatedCart = await cartRepository.findCartByUserId(userId, tx);
    if (!updatedCart) {
      throw new AppError("Failed to load updated cart details", 500);
    }

    return mapCartResponse(updatedCart);
  }, {
    timeout: 15000,
  });
}
