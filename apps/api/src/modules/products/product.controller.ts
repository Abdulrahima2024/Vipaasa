import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as productService from "./product.service";
import {
  GetProductsQuerySchema,
  SearchProductsQuerySchema,
  GetProductParamsSchema,
  CreateProductSchema,
  UpdateProductSchema,
} from "./product.validation";

/**
 * GET /categories
 * Retrieves hierarchical list of active categories
 */
export async function getCategories(req: AuthenticatedRequest, res: Response) {
  try {
    const tree = await productService.getCategoriesTree();
    return res.status(200).json(tree);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
}

/**
 * GET /products
 * Retrieves paginated list of active products with optional filters
 */
export async function getProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const validation = GetProductsQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.format(),
      });
    }

    const filter = { ...validation.data };
    if (filter.includeInactive && req.user?.role !== "SUPER_ADMIN") {
      filter.includeInactive = false;
    }

    const result = await productService.getProductsList(filter);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
}

/**
 * GET /products/:id
 * Retrieves detailed product model by its ID
 */
export async function getProductById(req: AuthenticatedRequest, res: Response) {
  try {
    const paramValidation = GetProductParamsSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: paramValidation.error.format(),
      });
    }

    const { id } = paramValidation.data;
    const isSuperAdmin = req.user?.role === "SUPER_ADMIN";
    const product = await productService.getProductDetails(id, isSuperAdmin);

    if (!product) {
      return res.status(404).json({ error: "Product not found or unavailable" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product details for ID ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to fetch product details" });
  }
}

/**
 * GET /products/search
 * Searches products by term matching Name, SKU, or Description
 */
export async function searchProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const validation = SearchProductsQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.format(),
      });
    }

    const result = await productService.searchProductsList(validation.data);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({ error: "Failed to search products" });
  }
}

/**
 * POST /products
 * Creates a new product with variants and pricing (Admin only)
 */
export async function createProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const validation = CreateProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.format(),
      });
    }

    const product = await productService.createProduct(validation.data);
    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ error: "Failed to create product" });
  }
}

/**
 * DELETE /products/:id
 * Soft deletes a product by ID (Admin only)
 */
export async function deleteProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const paramValidation = GetProductParamsSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: paramValidation.error.format(),
      });
    }

    const { id } = paramValidation.data;
    await productService.deleteProduct(id);
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(`Error deleting product ID ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to delete product" });
  }
}

/**
 * PATCH /products/:id
 * Updates a product's fields, pricing, and images (Admin only)
 */
export async function updateProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const paramValidation = GetProductParamsSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: paramValidation.error.format(),
      });
    }

    const bodyValidation = UpdateProductSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: bodyValidation.error.format(),
      });
    }

    const { id } = paramValidation.data;
    const updated = await productService.updateProduct(id, bodyValidation.data);
    return res.status(200).json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    console.error(`Error updating product ID ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to update product" });
  }
}

