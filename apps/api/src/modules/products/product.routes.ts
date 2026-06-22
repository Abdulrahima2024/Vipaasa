import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import {
  getCategories,
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductStats,
} from "./product.controller";

const router = Router();

import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Retrieve all active hierarchical categories
router.get("/categories", optionalAuthenticate, getCategories);

// Retrieve catalogue overview metrics (Admin only)
router.get("/products/stats", authenticate, authorize(["SUPER_ADMIN"]), getProductStats);

// Retrieve all active, priced, paginated products
router.get("/products", optionalAuthenticate, getProducts);

// Search active, priced, paginated products (registered before /products/:id to prevent conflicts)
router.get("/products/search", optionalAuthenticate, searchProducts);

// Retrieve detailed information of a single active product
router.get("/products/:id", optionalAuthenticate, getProductById);

// Create a new product with variants and pricing (Admin only)
router.post("/products", authenticate, authorize(["SUPER_ADMIN"]), upload.array("images", 5), createProduct);

// Delete a product (Admin only)
router.delete("/products/:id", authenticate, authorize(["SUPER_ADMIN"]), deleteProduct);

// Update a product (Admin only)
router.patch("/products/:id", authenticate, authorize(["SUPER_ADMIN"]), upload.array("images", 5), updateProduct);

export default router;

