import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as cartService from "./cart.service";
import {
  AddToCartSchema,
  UpdateCartItemQuantitySchema,
  CartItemParamSchema,
} from "./cart.validation";
import { AppError } from "../../shared/middleware/errorHandler";

/**
 * GET /cart
 * Retrieves the current user's cart
 */
export async function getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const cart = await cartService.getCart(userId);
    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /cart/items
 * Adds a product variant to the cart
 */
export async function addToCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const bodyValidation = AddToCartSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: bodyValidation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { productId, quantity } = bodyValidation.data;
    const cart = await cartService.addToCart(userId, productId, quantity);
    return res.status(200).json(cart);
    console.log("added to cart")
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /cart/items/:id
 * Updates quantity of a specific item in the cart
 */
export async function updateCartItemQuantity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const paramValidation = CartItemParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: paramValidation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const bodyValidation = UpdateCartItemQuantitySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: bodyValidation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { id } = paramValidation.data;
    const { quantity } = bodyValidation.data;

    const cart = await cartService.updateCartItemQuantity(userId, id, quantity);
    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /cart/items/:id
 * Removes a specific item from the cart
 */
export async function removeCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const paramValidation = CartItemParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: paramValidation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { id } = paramValidation.data;
    const cart = await cartService.removeCartItem(userId, id);
    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /cart
 * Clears all items in the user's cart
 */
export async function clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const cart = await cartService.clearCart(userId);
    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}
