import { OrderStatus, ReservationStatus, PaymentStatus, DeliveryStatus } from "@prisma/client";
import { AppError } from "../../shared/middleware/errorHandler";
import { prisma } from "../../config/database";

/**
 * Executes a customer checkout.
 * Validates cart, shipping/billing address, and inventory before creating the order and reservations.
 */
export async function checkout(
  userId: string,
  payload: {
    shippingAddressId?: string;
    shippingAddress?: {
      addressLine1: string;
      addressLine2?: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone?: string | null;
    };
    billingAddressId?: string;
    billingAddress?: {
      addressLine1: string;
      addressLine2?: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone?: string | null;
    };
  }
) {
  return prisma.$transaction(async (tx) => {
    // 1. Prevent duplicate checkout by row-locking the user's cart
    console.log(`\n========================================`);
    console.log(`[BACKEND] Starting Checkout Transaction for User: ${userId}`);
    console.log(`========================================`);
    
    const cart = await tx.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new AppError("Cart not found. Add items to your cart first.", 404);
    }

    // Row-lock the cart by updating its updatedAt timestamp
    await tx.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });
    console.log(`[BACKEND] Step 1: User Cart row-locked successfully.`);

    // 2. Validate Cart and items
    const cartWithItems = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                pricing: true,
                inventories: true,
              },
            },
          },
        },
      },
    });

    if (!cartWithItems || cartWithItems.items.length === 0) {
      throw new AppError("Your cart is empty.", 400);
    }

    // Check active status of products in cart
    for (const item of cartWithItems.items) {
      const variant = item.variant;
      if (!variant.product || !variant.product.isActive || variant.product.isDeleted) {
        throw new AppError(
          `Product "${variant.product?.name || variant.name}" is no longer active or available.`,
          400
        );
      }
    }
    console.log(`[BACKEND] Step 2: Validated Cart: contains ${cartWithItems.items.length} items. All items are active and valid.`);

    // 3. Resolve / Create Addresses
    let profile = await tx.customerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      const userObj = await tx.user.findUnique({ where: { id: userId } });
      profile = await tx.customerProfile.create({
        data: {
          userId,
          firstName: userObj?.email.split("@")[0] || "Customer",
          lastName: "User",
        },
      });
    }

    let shippingAddress: any;
    if (payload.shippingAddressId) {
      shippingAddress = await tx.customerAddress.findUnique({
        where: { id: payload.shippingAddressId },
        include: { profile: true },
      });
      if (!shippingAddress || shippingAddress.profile.userId !== userId) {
        throw new AppError("Invalid shipping address selected.", 400);
      }
    } else if (payload.shippingAddress) {
      shippingAddress = await tx.customerAddress.create({
        data: {
          profileId: profile.id,
          addressType: "SHIPPING",
          addressLine1: payload.shippingAddress.addressLine1,
          addressLine2: payload.shippingAddress.addressLine2 || null,
          city: payload.shippingAddress.city,
          state: payload.shippingAddress.state,
          postalCode: payload.shippingAddress.postalCode,
          country: payload.shippingAddress.country,
          phone: payload.shippingAddress.phone || null,
        },
      });
    } else {
      throw new AppError("Shipping address is required.", 400);
    }

    let billingAddress = shippingAddress;
    if (payload.billingAddressId) {
      if (payload.billingAddressId !== payload.shippingAddressId) {
        const dbBillingAddress = await tx.customerAddress.findUnique({
          where: { id: payload.billingAddressId },
          include: { profile: true },
        });
        if (!dbBillingAddress || dbBillingAddress.profile.userId !== userId) {
          throw new AppError("Invalid billing address selected.", 400);
        }
        billingAddress = dbBillingAddress;
      }
    } else if (payload.billingAddress) {
      billingAddress = await tx.customerAddress.create({
        data: {
          profileId: profile.id,
          addressType: "BILLING",
          addressLine1: payload.billingAddress.addressLine1,
          addressLine2: payload.billingAddress.addressLine2 || null,
          city: payload.billingAddress.city,
          state: payload.billingAddress.state,
          postalCode: payload.billingAddress.postalCode,
          country: payload.billingAddress.country,
          phone: payload.billingAddress.phone || null,
        },
      });
    }
    console.log(`[BACKEND] Step 3: Resolved Delivery Addresses successfully.`);
    console.log(`          - Shipping Address: ${shippingAddress.addressLine1}, ${shippingAddress.city}`);
    console.log(`          - Billing Address: ${billingAddress.addressLine1}, ${billingAddress.city}`);

    // 4. Validate Inventory availability
    for (const item of cartWithItems.items) {
      const variant = item.variant;
      const availableStock = variant.inventories.reduce(
        (sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved),
        0
      );

      if (item.quantity > availableStock) {
        throw new AppError(
          `Insufficient stock for "${variant.product.name} - ${variant.name}". Requested: ${item.quantity}, Available: ${availableStock}.`,
          400
        );
      }
    }
    console.log(`[BACKEND] Step 4: Validated inventory stock. Sufficient quantities available in warehouses.`);

    // 5. Calculate Order Totals
    let totalItemsPrice = 0;
    const itemsData = cartWithItems.items.map((item) => {
      const unitPrice = item.variant.pricing ? Number(item.variant.pricing.basePrice) : 0;
      const totalPrice = unitPrice * item.quantity;
      totalItemsPrice += totalPrice;

      return {
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    const taxAmount = Math.round(totalItemsPrice * 0.18 * 100) / 100; // 18% standard tax
    const shippingFee = totalItemsPrice >= 1000 ? 0 : 100; // Free shipping above 1000
    const discountAmount = 0;
    const totalPayable = totalItemsPrice + taxAmount + shippingFee - discountAmount;

    console.log(`[BACKEND] Step 5: Calculated Order Totals:`);
    console.log(`          - Items Subtotal: INR ${totalItemsPrice}`);
    console.log(`          - Shipping Fee:   INR ${shippingFee}`);
    console.log(`          - GST Tax (18%):  INR ${taxAmount}`);
    console.log(`          - Total Payable:  INR ${totalPayable}`);

    // 6. Create Order
    const order = await tx.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        totalItemsPrice,
        discountAmount,
        taxAmount,
        shippingFee,
        totalPayable,
        shippingAddressLine1: shippingAddress.addressLine1,
        shippingAddressLine2: shippingAddress.addressLine2,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPostalCode: shippingAddress.postalCode,
        shippingCountry: shippingAddress.country,
        billingAddressLine1: billingAddress.addressLine1,
        billingAddressLine2: billingAddress.addressLine2,
        billingCity: billingAddress.city,
        billingState: billingAddress.state,
        billingPostalCode: billingAddress.postalCode,
        billingCountry: billingAddress.country,
        paymentStatus: PaymentStatus.UNPAID,
        deliveryStatus: DeliveryStatus.PENDING,
      },
    });
    console.log(`[BACKEND] Step 6: Order successfully created in Database.`);
    console.log(`          - Database ID:  ${order.id}`);
    console.log(`          - Order Number: ${order.orderNumber}`);

    // 7. Create Order Items & Reserve Inventory
    for (const item of cartWithItems.items) {
      const unitPrice = item.variant.pricing ? Number(item.variant.pricing.basePrice) : 0;
      const totalPrice = unitPrice * item.quantity;
      const itemTax = Math.round(totalPrice * 0.18 * 100) / 100;

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
          discountAmount: 0,
          taxAmount: itemTax,
          totalPrice,
        },
      });

      // Reserve stock from warehouses
      let remainingToReserve = item.quantity;
      for (const inv of item.variant.inventories) {
        if (remainingToReserve <= 0) break;
        const availableInWarehouse = inv.quantityOnHand - inv.quantityReserved;
        if (availableInWarehouse <= 0) continue;

        const reserveAmount = Math.min(remainingToReserve, availableInWarehouse);

        // Update inventory reserved quantity
        await tx.inventory.update({
          where: { id: inv.id },
          data: {
            quantityReserved: { increment: reserveAmount },
          },
        });

        // Create StockReservation record
        await tx.stockReservation.create({
          data: {
            inventoryId: inv.id,
            orderId: order.id,
            quantity: reserveAmount,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins expiry
            status: ReservationStatus.PENDING,
          },
        });

        remainingToReserve -= reserveAmount;
      }
      console.log(`[BACKEND] Step 7: Created OrderItem and reserved ${item.quantity} units for variant ID ${item.variantId}`);
    }

    // 8. Create Order Status History
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: OrderStatus.PENDING,
        changedByUserId: userId,
        notes: "Order created successfully via checkout.",
      },
    });
    console.log(`[BACKEND] Step 8: Logged Order Status History entry.`);

    // 9. Clear Cart Items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    console.log(`[BACKEND] Step 9: Cleared user cart items.`);

    // Fetch and return the fully populated order details
    const finalizedOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        statusHistory: true,
      },
    });

    console.log(`[BACKEND] Order finalized successfully. Visible in Admin Dashboard Orders.`);
    console.log(`========================================\n`);

    return finalizedOrder;
  }, {
    timeout: 15000,
  });
}

/**
 * Retrieves a list of orders for the authenticated user.
 */
export async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      },
      statusHistory: true,
    },
  });
}

/**
 * Retrieves a specific order by ID after verifying customer ownership.
 */
export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      },
      statusHistory: true,
    },
  });

  // OWASP Best Practice: return 404 (Not Found) instead of 403 (Forbidden)
  // to avoid exposing the existence of other users' orders
  if (!order || order.userId !== userId) {
    throw new AppError("Order not found.", 404);
  }

  return order;
}

/**
 * Cancels a pending order and releases any reserved inventory.
 */
export async function cancelOrder(userId: string, orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new AppError("Order not found.", 404);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new AppError(`Cannot cancel order. Order status is currently "${order.status}". Only pending orders can be cancelled.`, 400);
    }

    // 1. Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });

    // 2. Fetch and release reserved stock
    const reservations = await tx.stockReservation.findMany({
      where: {
        orderId,
        status: ReservationStatus.PENDING,
      },
    });

    for (const reservation of reservations) {
      // Decrement quantityReserved on the corresponding Inventory record
      await tx.inventory.update({
        where: { id: reservation.inventoryId },
        data: {
          quantityReserved: { decrement: reservation.quantity },
        },
      });

      // Mark the reservation as CANCELLED
      await tx.stockReservation.update({
        where: { id: reservation.id },
        data: {
          status: ReservationStatus.CANCELLED,
        },
      });
    }

    // 3. Create status history entry
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: OrderStatus.CANCELLED,
        changedByUserId: userId,
        notes: "Order cancelled by customer.",
      },
    });

    // Return the updated order with final status history
    return tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        statusHistory: true,
      },
    });
  }, {
    timeout: 15000,
  });
}

/**
 * Retrieves all orders for the administration dashboard.
 */
export async function getAdminOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
      statusHistory: true,
      payments: true,
    },
  });
}

