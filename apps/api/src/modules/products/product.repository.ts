import { Prisma } from "@prisma/client";
import { ProductFilter, SearchFilter } from "./product.types";
import { prisma } from "../../config/database";

/**
 * Find all active categories
 */
export async function findCategories() {
  return prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Find active, non-deleted products with pricing, applying filters and pagination
 */
export async function findProducts(filter: ProductFilter) {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const skip = (page - 1) * limit;

  // Build the where clause
  const where: Prisma.ProductWhereInput = {
    isDeleted: false,
  };

  if (!filter.includeInactive) {
    where.isActive = true;
    // Products without pricing should not be shown
    where.variants = {
      some: {
        pricing: {
          isNot: null,
        },
      },
    };
  }

  // Category filter
  if (filter.categoryId) {
    where.categoryId = filter.categoryId;
  }

  // Price filter
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    const priceCondition: Prisma.DecimalFilter = {};
    if (filter.minPrice !== undefined) {
      priceCondition.gte = new Prisma.Decimal(filter.minPrice);
    }
    if (filter.maxPrice !== undefined) {
      priceCondition.lte = new Prisma.Decimal(filter.maxPrice);
    }

    where.variants = {
      some: {
        pricing: {
          basePrice: priceCondition,
        },
      },
    };
  }

  // Sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (filter.sortBy === "name") {
    orderBy = { name: filter.sortOrder || "asc" };
  } else if (filter.sortBy === "createdAt") {
    orderBy = { createdAt: filter.sortOrder || "desc" };
  }

  // Fetch count and items in parallel to optimize DB performance
  const [total, items] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            url: true,
            altText: true,
            isPrimary: true,
          },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            name: true,
            skuStatus: true,
            weightGrams: true,
            pricing: {
              select: {
                basePrice: true,
                compareAtPrice: true,
                currency: true,
              },
            },
            inventories: {
              select: {
                quantityOnHand: true,
                quantityReserved: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    items,
    total,
  };
}

/**
 * Find detailed product by ID (must be active and non-deleted)
 */
export async function findProductById(id: string, includeInactive: boolean = false) {
  const where: Prisma.ProductWhereInput = {
    id,
    isDeleted: false,
  };

  if (!includeInactive) {
    where.isActive = true;
    where.variants = {
      some: {
        pricing: {
          isNot: null,
        },
      },
    };
  }

  return prisma.product.findFirst({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          url: true,
          altText: true,
          isPrimary: true,
        },
      },
      variants: {
        select: {
          id: true,
          sku: true,
          name: true,
          skuStatus: true,
          weightGrams: true,
          pricing: {
            select: {
              basePrice: true,
              compareAtPrice: true,
              currency: true,
            },
          },
          inventories: {
            select: {
              quantityOnHand: true,
              quantityReserved: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Search products by name, SKU, or description
 */
export async function searchProducts(filter: SearchFilter) {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const skip = (page - 1) * limit;
  const q = filter.q;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    isDeleted: false,
    variants: {
      some: {
        pricing: {
          isNot: null,
        },
      },
    },
    OR: [
      {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        variants: {
          some: {
            sku: {
              contains: q,
              mode: "insensitive",
            },
          },
        },
      },
    ],
  };

  const [total, items] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            url: true,
            altText: true,
            isPrimary: true,
          },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            name: true,
            skuStatus: true,
            weightGrams: true,
            pricing: {
              select: {
                basePrice: true,
                compareAtPrice: true,
                currency: true,
              },
            },
            inventories: {
              select: {
                quantityOnHand: true,
                quantityReserved: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    items,
    total,
  };
}

/**
 * Create a new product with variants, pricing and inventory
 */
export async function createProduct(payload: {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  isActive?: boolean;
  imageBg?: string;
  imageEmoji?: string;
  images?: string[];
  variants: Array<{
    name: string;
    sku?: string;
    weightGrams: number;
    skuStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";
    price: number;
    compareAtPrice?: number;
    stock?: number;
  }>;
}) {
  return prisma.$transaction(
    async (tx) => {
      // 1. Find a default active warehouse to associate inventory with
    const warehouse = await tx.warehouse.findFirst({
      where: { isActive: true },
    });

    // 2. Create the Product
    const product = await tx.product.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        categoryId: payload.categoryId,
        isActive: payload.isActive ?? true,
      },
    });

    // 3. Create Product Image if any provided (or use a mock/emoji placeholder)
    if (payload.images && payload.images.length > 0) {
      await tx.productImage.createMany({
        data: payload.images.map((url, index) => ({
          productId: product.id,
          url,
          altText: payload.name,
          sortOrder: index,
          isPrimary: index === 0,
        })),
      });
    } else if (payload.imageEmoji) {
      // Create a virtual url/placeholder image based on emoji and bg
      await tx.productImage.create({
        data: {
          productId: product.id,
          url: `emoji://${payload.imageEmoji}?bg=${encodeURIComponent(payload.imageBg || "bg-[#edf6ee]")}`,
          altText: payload.name,
          sortOrder: 0,
          isPrimary: true,
        },
      });
    }

    // 4. Create variants, pricing and inventory
    for (const v of payload.variants) {
      const generatedSku = v.sku || `VPA-${payload.name.slice(0, 3).toUpperCase()}-${v.weightGrams}G-${Math.floor(100 + Math.random() * 900)}`;
      
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: generatedSku,
          name: v.name,
          weightGrams: v.weightGrams,
          skuStatus: v.skuStatus || "IN_STOCK",
        },
      });

      // Pricing
      await tx.productPricing.create({
        data: {
          variantId: variant.id,
          basePrice: new Prisma.Decimal(v.price),
          compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : null,
          currency: "INR",
        },
      });

      // Inventory
      if (warehouse) {
        await tx.inventory.create({
          data: {
            warehouseId: warehouse.id,
            variantId: variant.id,
            quantityOnHand: v.stock ?? 0,
            quantityReserved: 0,
            reorderLevel: 10,
          },
        });
      }
    }

    return product;
  }, {
    timeout: 30000
  });
}

/**
 * Update an existing product by ID
 */
export async function updateProduct(id: string, payload: {
  name?: string;
  categoryId?: string;
  description?: string;
  isActive?: boolean;
  images?: string[];
  variants?: Array<{
    name?: string;
    sku?: string;
    weightGrams?: number;
    skuStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";
    price?: number;
    compareAtPrice?: number;
    stock?: number;
  }>;
}) {
  return prisma.$transaction(
    async (tx) => {
      // 1. Update product base fields
    const productData: Prisma.ProductUpdateInput = {};
    if (payload.name !== undefined) productData.name = payload.name;
    if (payload.description !== undefined) productData.description = payload.description;
    if (payload.isActive !== undefined) productData.isActive = payload.isActive;
    if (payload.categoryId !== undefined) {
      productData.category = { connect: { id: payload.categoryId } };
    }

    const product = await tx.product.update({
      where: { id },
      data: productData,
    });

    // 2. Update images if provided (replace all existing)
    if (payload.images !== undefined) {
      // Delete existing images
      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      // Create new images
      if (payload.images.length > 0) {
        await tx.productImage.createMany({
          data: payload.images.map((url, index) => ({
            productId: id,
            url,
            altText: product.name,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        });
      }
    }

    // 3. Update variants if provided
    if (payload.variants && payload.variants.length > 0) {
      // Find a warehouse in case we need to create a new variant
      const warehouse = await tx.warehouse.findFirst({
        where: { isActive: true },
      });

      // Get existing variants for this product
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
        include: {
          pricing: true,
          inventories: true,
        },
      });

      for (let i = 0; i < payload.variants.length; i++) {
        const v = payload.variants[i];
        
        // Match variant by weightGrams
        const existingVariant = existingVariants.find(ev => ev.weightGrams === v.weightGrams);

        if (existingVariant) {
          // Update existing variant
          const variantUpdateData: any = {};
          if (v.name !== undefined) variantUpdateData.name = v.name;
          if (v.weightGrams !== undefined) variantUpdateData.weightGrams = v.weightGrams;
          if (v.skuStatus !== undefined) variantUpdateData.skuStatus = v.skuStatus;
          if (v.sku !== undefined) variantUpdateData.sku = v.sku;

          if (Object.keys(variantUpdateData).length > 0) {
            await tx.productVariant.update({
              where: { id: existingVariant.id },
              data: variantUpdateData,
            });
          }

          // Update pricing if price fields provided
          if (v.price !== undefined || v.compareAtPrice !== undefined) {
            const pricingData: any = {};
            if (v.price !== undefined) pricingData.basePrice = new Prisma.Decimal(v.price);
            if (v.compareAtPrice !== undefined) {
              pricingData.compareAtPrice = v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : null;
            }

            if (existingVariant.pricing) {
              await tx.productPricing.update({
                where: { id: existingVariant.pricing.id },
                data: pricingData,
              });
            } else {
              await tx.productPricing.create({
                data: {
                  variantId: existingVariant.id,
                  basePrice: new Prisma.Decimal(v.price || 0),
                  compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : null,
                  currency: "INR",
                },
              });
            }
          }

          // Update inventory stock if provided
          if (v.stock !== undefined && existingVariant.inventories.length > 0) {
            await tx.inventory.update({
              where: { id: existingVariant.inventories[0].id },
              data: { quantityOnHand: v.stock },
            });
          }
        } else {
          // Create new variant if not existing
          const generatedSku = v.sku || `VPA-${product.name.slice(0, 3).toUpperCase()}-${v.weightGrams || 1000}G-${Math.floor(100 + Math.random() * 900)}`;
          
          const newVariant = await tx.productVariant.create({
            data: {
              productId: id,
              sku: generatedSku,
              name: v.name || `${v.weightGrams}g Pack`,
              weightGrams: v.weightGrams || 1000,
              skuStatus: v.skuStatus || "IN_STOCK",
            },
          });

          await tx.productPricing.create({
            data: {
              variantId: newVariant.id,
              basePrice: new Prisma.Decimal(v.price || 0),
              compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : null,
              currency: "INR",
            },
          });

          if (warehouse) {
            await tx.inventory.create({
              data: {
                warehouseId: warehouse.id,
                variantId: newVariant.id,
                quantityOnHand: v.stock ?? 0,
                quantityReserved: 0,
                reorderLevel: 10,
              },
            });
          }
        }
      }
    }

    // Return the updated product with all relations
    return tx.product.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            url: true,
            altText: true,
            isPrimary: true,
          },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            name: true,
            skuStatus: true,
            weightGrams: true,
            pricing: {
              select: {
                basePrice: true,
                compareAtPrice: true,
                currency: true,
              },
            },
            inventories: {
              select: {
                quantityOnHand: true,
                quantityReserved: true,
              },
            },
          },
        },
      },
    });
  }, {
    timeout: 30000
  });
}

/**
 * Soft delete a product by ID
 */
export async function deleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
}

export async function getProductStats() {
  const totalProducts = await prisma.product.count({
    where: { isDeleted: false },
  });

  const activeProducts = await prisma.product.count({
    where: { isDeleted: false, isActive: true },
  });

  const activePercentage = totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0;

  const lowStockCount = await prisma.productVariant.count({
    where: {
      product: { isDeleted: false },
      skuStatus: { not: "DISCONTINUED" },
      inventories: {
        some: {
          quantityOnHand: { lte: 24 },
        },
      },
    },
  });

  const pricingAndInventories = await prisma.productVariant.findMany({
    where: {
      product: { isDeleted: false },
    },
    select: {
      pricing: {
        select: {
          basePrice: true,
        },
      },
      inventories: {
        select: {
          quantityOnHand: true,
          quantityReserved: true,
        },
      },
    },
  });

  let totalValuation = 0;
  pricingAndInventories.forEach((pv) => {
    if (pv.pricing && pv.inventories) {
      const price = parseFloat(pv.pricing.basePrice.toString());
      const stock = pv.inventories.reduce((sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved), 0);
      totalValuation += price * Math.max(0, stock);
    }
  });

  return {
    totalProducts,
    activePercentage,
    lowStockCount,
    totalValuation,
  };
}
