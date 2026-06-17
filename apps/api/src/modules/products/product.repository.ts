import { PrismaClient, Prisma } from "@prisma/client";
import { ProductFilter, SearchFilter } from "./product.types";

const prisma = new PrismaClient();

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
    isActive: true,
    isDeleted: false,
    // Products without pricing should not be shown
    variants: {
      some: {
        pricing: {
          isNot: null,
        },
      },
    },
  };

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
export async function findProductById(id: string) {
  return prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      isDeleted: false,
      variants: {
        some: {
          pricing: {
            isNot: null,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
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
  return prisma.$transaction(async (tx) => {
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
  });
}

