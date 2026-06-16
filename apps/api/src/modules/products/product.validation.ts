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

export type GetProductsQuery = z.infer<typeof GetProductsQuerySchema>;
export type SearchProductsQuery = z.infer<typeof SearchProductsQuerySchema>;
