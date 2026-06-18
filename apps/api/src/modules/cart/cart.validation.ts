import { z } from "zod";

export const AddToCartSchema = z.object({
  productId: z.string().uuid({
    message: "Product ID must be a valid UUID",
  }),
  quantity: z.number().int({
    message: "Quantity must be an integer",
  }).positive({
    message: "Quantity must be greater than zero",
  }),
});

export const UpdateCartItemQuantitySchema = z.object({
  quantity: z.number().int({
    message: "Quantity must be an integer",
  }).positive({
    message: "Quantity must be greater than zero",
  }),
});

export const CartItemParamSchema = z.object({
  id: z.string().uuid({
    message: "Cart Item ID must be a valid UUID",
  }),
});
