import { prisma } from "../../config/database";
import { AdjustmentReason } from "@prisma/client";

export async function getInventory() {
  // Retrieve all variants with product, category, pricing, and inventory details
  const variants = await prisma.productVariant.findMany({
    include: {
      product: {
        include: {
          category: true,
        },
      },
      pricing: true,
      inventories: {
        include: {
          warehouse: true,
        },
      },
    },
    orderBy: {
      sku: "asc",
    },
  });

  // Ensure every variant has at least one inventory record
  // If not, we create one for WH-CENTRAL so we can show/manage stock
  const centralWarehouse = await prisma.warehouse.findFirst({
    where: { code: "WH-CENTRAL" },
  });

  const items = [];

  for (const variant of variants) {
    let inventoryRecord = variant.inventories.find(
      (inv) => inv.warehouse.code === "WH-CENTRAL"
    );

    if (!inventoryRecord && centralWarehouse) {
      // Create default inventory record in DB
      inventoryRecord = await prisma.inventory.create({
        data: {
          warehouseId: centralWarehouse.id,
          variantId: variant.id,
          quantityOnHand: 100, // Default seed level
          quantityReserved: 0,
          reorderLevel: 15,
        },
        include: {
          warehouse: true,
        },
      });
      variant.inventories.push(inventoryRecord);
    }

    const qtyOnHand = inventoryRecord ? inventoryRecord.quantityOnHand : 0;
    const qtyReserved = inventoryRecord ? inventoryRecord.quantityReserved : 0;
    const reorderLevel = inventoryRecord ? inventoryRecord.reorderLevel : 10;

    // Selling price and purchase cost mapping
    const sellingPrice = variant.pricing ? parseFloat(variant.pricing.basePrice.toString()) : 100;
    const purchaseCost = Math.round(sellingPrice * 0.7); // Assume 70% cost of goods sold

    // Clean unit type
    let unitType = "kg";
    if (variant.name.toLowerCase().includes("honey") || variant.name.toLowerCase().includes("ghee") || variant.name.toLowerCase().includes("oil")) {
      unitType = "liters";
    } else if (variant.name.toLowerCase().includes("packet") || variant.name.toLowerCase().includes("piece") || variant.name.toLowerCase().includes("box")) {
      unitType = "units";
    }

    // Partition warehouse and store stock realistically
    const storeStock = Math.max(0, Math.floor(qtyOnHand * 0.2));
    const warehouseStock = Math.max(0, qtyOnHand - storeStock);

    items.push({
      id: variant.id,
      name: `${variant.product.name} - ${variant.name}`,
      sku: variant.sku,
      category: variant.product.category.name,
      unitType,
      purchaseCost,
      sellingPrice,
      openingStock: qtyOnHand + 50, // Static opening stock reference
      warehouseStock,
      storeStock,
      reservedStock: qtyReserved,
      lowStockAlert: reorderLevel,
    });
  }

  return items;
}

export async function adjustStock(
  userId: string,
  data: {
    variantId: string;
    quantityChange: number;
    reason: string;
  }
) {
  const centralWarehouse = await prisma.warehouse.findFirst({
    where: { code: "WH-CENTRAL" },
  });

  if (!centralWarehouse) {
    throw new Error("Central warehouse not found in database");
  }

  // Find or create inventory record
  let inventory = await prisma.inventory.findFirst({
    where: {
      variantId: data.variantId,
      warehouseId: centralWarehouse.id,
    },
  });

  if (!inventory) {
    inventory = await prisma.inventory.create({
      data: {
        variantId: data.variantId,
        warehouseId: centralWarehouse.id,
        quantityOnHand: 0,
        quantityReserved: 0,
        reorderLevel: 10,
      },
    });
  }

  // Map adjustment reason to database enum
  let dbReason: AdjustmentReason = AdjustmentReason.AUDIT_CORRECTION;
  const upperReason = data.reason.toUpperCase();
  if (upperReason.includes("DAMAGE")) dbReason = AdjustmentReason.DAMAGED;
  else if (upperReason.includes("THEFT")) dbReason = AdjustmentReason.THEFT;
  else if (upperReason.includes("EXPIRE")) dbReason = AdjustmentReason.EXPIRED;

  // Perform transaction to update inventory quantity and insert adjustment log
  return prisma.$transaction(async (tx) => {
    const updatedInventory = await tx.inventory.update({
      where: { id: inventory!.id },
      data: {
        quantityOnHand: {
          increment: data.quantityChange,
        },
      },
    });

    await tx.stockAdjustment.create({
      data: {
        inventoryId: inventory!.id,
        adjustedByUserId: userId,
        quantityChange: data.quantityChange,
        reason: dbReason,
      },
    });

    return updatedInventory;
  });
}

export async function updateRules(variantId: string, rules: { reorderLevel: number }) {
  const centralWarehouse = await prisma.warehouse.findFirst({
    where: { code: "WH-CENTRAL" },
  });

  if (!centralWarehouse) {
    throw new Error("Central warehouse not found");
  }

  const inventory = await prisma.inventory.findFirst({
    where: {
      variantId,
      warehouseId: centralWarehouse.id,
    },
  });

  if (!inventory) {
    return prisma.inventory.create({
      data: {
        variantId,
        warehouseId: centralWarehouse.id,
        quantityOnHand: 0,
        quantityReserved: 0,
        reorderLevel: rules.reorderLevel,
      },
    });
  }

  return prisma.inventory.update({
    where: { id: inventory.id },
    data: {
      reorderLevel: rules.reorderLevel,
    },
  });
}
