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
