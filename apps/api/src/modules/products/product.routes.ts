import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  getCategories,
  getProducts,
  getProductById,
  searchProducts,
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

export default router;
