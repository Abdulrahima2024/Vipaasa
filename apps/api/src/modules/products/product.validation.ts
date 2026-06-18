import { z } from "zod";

export const GetProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, { message: "Page must be greater than or equal to 1" }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val >= 1 && val <= 100, { message: "Limit must be between 1 and 100" }),
  categoryId: z.string().uuid({ message: "Invalid category ID format" }).optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || val >= 0, { message: "Minimum price cannot be negative" }),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || val >= 0, { message: "Maximum price cannot be negative" }),
  sortBy: z.enum(["price", "createdAt", "name"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === "true"),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: "Minimum price must be less than or equal to maximum price",
    path: ["minPrice"],
  }
);

export const SearchProductsQuerySchema = z.object({
  q: z
    .string()
    .min(1, { message: "Search query must be at least 1 character long" })
    .trim(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, { message: "Page must be greater than or equal to 1" }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val >= 1 && val <= 100, { message: "Limit must be between 1 and 100" }),
});

export const GetProductParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid product ID format" }),
});

export const CreateProductSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  categoryId: z.string().uuid({ message: "Invalid category ID format" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters long" }),
  isActive: z.boolean().default(true),
  imageEmoji: z.string().optional(),
  imageBg: z.string().optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      sku: z.string().optional(),
      weightGrams: z.number().int().positive(),
      skuStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "DISCONTINUED"]).default("IN_STOCK"),
      price: z.number().positive(),
      compareAtPrice: z.number().nonnegative().optional(),
      stock: z.number().int().nonnegative().default(0),
    })
  ).min(1, { message: "At least one variant must be configured" }),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }).optional(),
  categoryId: z.string().uuid({ message: "Invalid category ID format" }).optional(),
  description: z.string().min(5, { message: "Description must be at least 5 characters long" }).optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(
    z.object({
      name: z.string().min(1).optional(),
      sku: z.string().optional(),
      weightGrams: z.number().int().positive().optional(),
      skuStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "DISCONTINUED"]).default("IN_STOCK").optional(),
      price: z.number().positive().optional(),
      compareAtPrice: z.number().nonnegative().optional(),
      stock: z.number().int().nonnegative().optional(),
    })
  ).optional(),
});

export type GetProductsQuery = z.infer<typeof GetProductsQuerySchema>;
export type SearchProductsQuery = z.infer<typeof SearchProductsQuerySchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

