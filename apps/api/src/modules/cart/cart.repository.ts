import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

export type Tx = Prisma.TransactionClient;

/**
 * Gets a helper reference to the DB instance (either transaction client or standard prisma)
 */
function getDb(tx?: Tx) {
  return tx || prisma;
}

/**
 * Finds a cart by userId, including items, product variant details, parent product status, pricing, and inventories
 */
export async function findCartByUserId(userId: string, tx?: Tx) {
  return getDb(tx).cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
              pricing: true,
              inventories: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Creates a new cart for a user
 */
export async function createCart(userId: string, tx?: Tx) {
  return getDb(tx).cart.create({
    data: {
      userId,
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
              pricing: true,
              inventories: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Finds a specific cart item within a cart by variantId
 */
export async function findCartItem(cartId: string, variantId: string, tx?: Tx) {
  return getDb(tx).cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId,
        variantId,
      },
    },
  });
}

/**
 * Creates a new cart item
 */
export async function createCartItem(cartId: string, variantId: string, quantity: number, tx?: Tx) {
  return getDb(tx).cartItem.create({
    data: {
      cartId,
      variantId,
      quantity,
    },
  });
}

/**
 * Updates the quantity of a specific cart item
 */
export async function updateCartItemQuantity(itemId: string, quantity: number, tx?: Tx) {
  return getDb(tx).cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
}

/**
 * Deletes a specific cart item
 */
export async function deleteCartItem(itemId: string, tx?: Tx) {
  return getDb(tx).cartItem.delete({
    where: { id: itemId },
  });
}

/**
 * Deletes all cart items for a given cartId
 */
export async function clearCartItems(cartId: string, tx?: Tx) {
  return getDb(tx).cartItem.deleteMany({
    where: { cartId },
  });
}

/**
 * Finds a cart item by its ID, including the cart to check user ownership
 */
export async function findCartItemById(itemId: string, tx?: Tx) {
  return getDb(tx).cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
    },
  });
}

/**
 * Fetches product variant details, including pricing, parent product status, and inventories
 */
export async function getVariantWithDetails(variantId: string, tx?: Tx) {
  return getDb(tx).productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: true,
      pricing: true,
      inventories: true,
    },
  });
}
