import { z } from "zod";

export const AddressSchema = z.object({
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional().nullable(),
});

export const CheckoutRequestSchema = z.object({
  shippingAddressId: z.string().uuid().optional(),
  shippingAddress: AddressSchema.optional(),
  billingAddressId: z.string().uuid().optional(),
  billingAddress: AddressSchema.optional(),
}).refine(data => data.shippingAddressId || data.shippingAddress, {
  message: "Either shippingAddressId or shippingAddress details must be provided",
  path: ["shippingAddressId"]
});

export const OrderParamSchema = z.object({
  id: z.string().uuid({
    message: "Order ID must be a valid UUID",
  }),
});
