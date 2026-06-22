import * as productRepository from "./product.repository";
import { slugify } from "../../shared/utils/slugify";
import { CreateProductInput, UpdateProductInput } from "./product.validation";
import {
  CategoryTreeItem,
  ProductFilter,
  SearchFilter,
  ProductItem,
  ProductDetail,
  PaginatedResult,
} from "./product.types";

/**
 * Builds a hierarchical tree from a flat list of categories
 */
export async function getCategoriesTree(): Promise<CategoryTreeItem[]> {
  const categories = await productRepository.findCategories();
  
  const categoryMap = new Map<string, CategoryTreeItem>();
  const roots: CategoryTreeItem[] = [];

  // Initialize all items in the map with empty children list
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parentId: cat.parentId,
      children: [],
    });
  });

  // Construct hierarchy
  categories.forEach((cat) => {
    const item = categoryMap.get(cat.id)!;
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(item);
      } else {
        // Parent is either inactive or doesn't exist, treat as root
        roots.push(item);
      }
    } else {
      roots.push(item);
    }
  });

  return roots;
}

/**
 * Maps raw database product output to clean customer-facing API models
 */
function mapProductToItem(prod: any): ProductItem {
  // Find the lowest price among variants
  let minPrice = Infinity;
  prod.variants.forEach((v: any) => {
    if (v.pricing) {
      const priceVal = parseFloat(v.pricing.basePrice.toString());
      if (priceVal < minPrice) {
        minPrice = priceVal;
      }
    }
  });

  // Handle fallback if minPrice is still Infinity
  const price = minPrice === Infinity ? 0 : minPrice;

  // Calculate available stock across variants
  let totalStockAvailable = 0;
  prod.variants.forEach((v: any) => {
    if (v.skuStatus !== "DISCONTINUED") {
      const variantStock = v.inventories.reduce(
        (sum: number, inv: any) => sum + (inv.quantityOnHand - inv.quantityReserved),
        0
      );
      totalStockAvailable += Math.max(0, variantStock);
    }
  });

  const stockStatus = totalStockAvailable > 0 ? "IN_STOCK" : "OUT_OF_STOCK";

  // Map images
  const images = prod.images.map((img: any) => img.url);

  return {
    id: prod.id,
    name: prod.name,
    description: prod.description,
    price,
    images,
    category: {
      id: prod.category.id,
      name: prod.category.name,
      slug: prod.category.slug,
    },
    stockStatus,
    isActive: prod.isActive,
    variants: prod.variants,
  };
}

/**
 * Gets paginated list of products with filters
 */
export async function getProductsList(
  filter: ProductFilter
): Promise<PaginatedResult<ProductItem>> {
  const { items, total } = await productRepository.findProducts(filter);
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const totalPages = Math.ceil(total / limit);

  // Map pricing and stock status dynamically
  let mappedItems = items.map(mapProductToItem);

  // Handle memory sorting by price if requested (since Prisma cannot order by relation average/minimum easily)
  if (filter.sortBy === "price") {
    const isAsc = filter.sortOrder === "asc";
    mappedItems = mappedItems.sort((a, b) => {
      return isAsc ? a.price - b.price : b.price - a.price;
    });
  }

  return {
    items: mappedItems,
    page,
    limit,
    total,
    totalPages,
  };
}

/**
 * Gets detailed product view by ID
 */
export async function getProductDetails(id: string, includeInactive: boolean = false): Promise<ProductDetail | null> {
  const prod = await productRepository.findProductById(id, includeInactive);
  if (!prod) return null;

  // Find lowest price
  let minPrice = Infinity;
  prod.variants.forEach((v: any) => {
    if (v.pricing) {
      const priceVal = parseFloat(v.pricing.basePrice.toString());
      if (priceVal < minPrice) {
        minPrice = priceVal;
      }
    }
  });
  const price = minPrice === Infinity ? 0 : minPrice;

  // Calculate available stock
  let totalStockAvailable = 0;
  prod.variants.forEach((v: any) => {
    if (v.skuStatus !== "DISCONTINUED") {
      const variantStock = v.inventories.reduce(
        (sum: number, inv: any) => sum + (inv.quantityOnHand - inv.quantityReserved),
        0
      );
      totalStockAvailable += Math.max(0, variantStock);
    }
  });
  const stockStatus = totalStockAvailable > 0 ? "IN_STOCK" : "OUT_OF_STOCK";

  return {
    id: prod.id,
    name: prod.name,
    description: prod.description,
    price,
    images: prod.images.map((img: any) => ({
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
    })),
    category: {
      id: prod.category.id,
      name: prod.category.name,
      slug: prod.category.slug,
    },
    stockStatus,
    isActive: prod.isActive,
    variants: prod.variants,
  };
}

/**
 * Searches products
 */
export async function searchProductsList(
  filter: SearchFilter
): Promise<PaginatedResult<ProductItem>> {
  const { items, total } = await productRepository.searchProducts(filter);
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const totalPages = Math.ceil(total / limit);

  const mappedItems = items.map(mapProductToItem);

  return {
    items: mappedItems,
    page,
    limit,
    total,
    totalPages,
  };
}

import { uploadImageToCloudinary } from "../../shared/utils/cloudinary";

/**
 * Creates a new product with variants, pricing and inventory
 */
export async function createProduct(input: CreateProductInput, files?: Express.Multer.File[]) {
  // Generate product slug
  const baseSlug = slugify(input.name);
  const slugSuffix = Math.floor(1000 + Math.random() * 9000);
  const slug = `${baseSlug}-${slugSuffix}`;

  const uploadedUrls: string[] = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const result = await uploadImageToCloudinary(file.buffer, "products");
      uploadedUrls.push(result.url);
    }
  }

  const finalImages = [...(input.images || []), ...uploadedUrls];

  return productRepository.createProduct({
    ...input,
    images: finalImages,
    slug,
  });
}

/**
 * Deletes a product by ID
 */
export async function deleteProduct(id: string) {
  return productRepository.deleteProduct(id);
}

/**
 * Updates a product by ID
 */
export async function updateProduct(id: string, input: UpdateProductInput, files?: Express.Multer.File[]) {
  const uploadedUrls: string[] = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const result = await uploadImageToCloudinary(file.buffer, "products");
      uploadedUrls.push(result.url);
    }
  }

  const finalImages = input.images && input.images.length > 0 || uploadedUrls.length > 0 
    ? [...(input.images || []), ...uploadedUrls] 
    : undefined;

  return productRepository.updateProduct(id, {
    ...input,
    images: finalImages,
  });
}

/**
 * Gets product inventory catalogue overview stats
 */
export async function getProductStats() {
  return productRepository.getProductStats();
}
