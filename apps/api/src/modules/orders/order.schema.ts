import { z } from "zod";

export const CheckoutRequestSchema = z.object({
  shippingAddressId: z.string().uuid({
    message: "Shipping address ID must be a valid UUID",
  }),
  billingAddressId: z.string().uuid({
    message: "Billing address ID must be a valid UUID",
  }).optional(),
});

export const OrderParamSchema = z.object({
  id: z.string().uuid({
    message: "Order ID must be a valid UUID",
  }),
});
