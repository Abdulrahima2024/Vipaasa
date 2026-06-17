import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import {
  getCategories,
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
} from "./product.controller";

const router = Router();

// Retrieve all active hierarchical categories
router.get("/categories", authenticate, getCategories);

// Retrieve all active, priced, paginated products
router.get("/products", authenticate, getProducts);

// Search active, priced, paginated products (registered before /products/:id to prevent conflicts)
router.get("/products/search", authenticate, searchProducts);

// Retrieve detailed information of a single active product
router.get("/products/:id", authenticate, getProductById);

// Create a new product with variants and pricing (Admin only)
router.post("/products", authenticate, authorize(["SUPER_ADMIN"]), createProduct);

export default router;

