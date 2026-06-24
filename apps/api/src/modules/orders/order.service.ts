import { OrderStatus, ReservationStatus, PaymentStatus, DeliveryStatus, AssignmentStatus } from "@prisma/client";
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
    couponCode?: string;
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
    
    let discountAmount = 0;
    let appliedCouponId = null;

    if (payload.couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: payload.couponCode } });
      if (!coupon) throw new AppError("Invalid coupon code", 400);
      if (coupon.status !== "ACTIVE") throw new AppError("Coupon is not active", 400);
      
      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) {
        throw new AppError("Coupon has expired or is not yet active", 400);
      }

      if (Number(totalItemsPrice) < Number(coupon.minOrderAmount)) {
        throw new AppError(`Minimum order amount must be ₹${coupon.minOrderAmount}`, 400);
      }

      if (coupon.usageLimit) {
        const totalUsage = await tx.couponUsage.count({ where: { couponId: coupon.id } });
        if (totalUsage >= coupon.usageLimit) {
          throw new AppError("Coupon usage limit reached", 400);
        }
      }

      const userUsage = await tx.couponUsage.count({
        where: { couponId: coupon.id, userId }
      });

      if (userUsage >= coupon.perUserLimit) {
        throw new AppError("You have already reached the usage limit for this coupon", 400);
      }

      if (coupon.discountType === "PERCENTAGE") {
        discountAmount = (totalItemsPrice * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
          discountAmount = Number(coupon.maxDiscount);
        }
      } else {
        discountAmount = Number(coupon.discountValue);
      }
      
      appliedCouponId = coupon.id;
    }

    const totalPayable = totalItemsPrice + taxAmount + shippingFee - discountAmount;

    console.log(`[BACKEND] Step 5: Calculated Order Totals:`);
    console.log(`          - Items Subtotal: INR ${totalItemsPrice}`);
    console.log(`          - Shipping Fee:   INR ${shippingFee}`);
    console.log(`          - GST Tax (18%):  INR ${taxAmount}`);
    if (discountAmount > 0) {
      console.log(`          - Discount:       INR ${discountAmount}`);
    }
    console.log(`          - Total Payable:  INR ${totalPayable}`);

    // 6. Create Order
    const order = await tx.order.create({
      data: {
        userId,
        status: OrderStatus.CONFIRMED,
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
        couponId: appliedCouponId,
      },
    });

    if (appliedCouponId) {
      await tx.couponUsage.create({
        data: {
          couponId: appliedCouponId,
          userId,
          orderId: order.id,
          discount: discountAmount,
        }
      });
      console.log(`[BACKEND] Step 6b: Recorded Coupon Usage for coupon ID ${appliedCouponId}.`);
    }

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
        status: OrderStatus.CONFIRMED,
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

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new AppError(`Cannot cancel order. Order status is currently "${order.status}". Only pending or confirmed orders can be cancelled.`, 400);
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
export async function getAdminOrders(page = 1, limit = 20, search?: string, statusFilter?: string) {
  const where: any = {};
  
  if (statusFilter && statusFilter !== "All") {
    where.status = statusFilter;
  }
  
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { profile: { firstName: { contains: search, mode: "insensitive" } } } }
    ];
  }

  const [data, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
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
        OrderAssignment: {
          include: {
            deliveryPartner: true,
          }
        }
      },
    }),
    prisma.order.count({ where })
  ]);

  return {
    data,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  };
}

/**
 * Retrieves aggregate statistics for all valid orders.
 */
export async function getAdminOrderStats() {
  const result = await prisma.order.aggregate({
    _sum: { totalPayable: true },
    _count: true,
    where: {
      status: {
        notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED]
      },
      paymentStatus: {
        notIn: [PaymentStatus.REFUNDED]
      }
    }
  });

  return {
    totalRevenue: result._sum.totalPayable || 0,
    totalOrders: result._count || 0,
  };
}

/**
 * Updates an order status, payment status, and delivery status by admin.
 */
export async function updateOrderStatusAdmin(
  orderId: string,
  newStatus: string,
  notes: string | undefined,
  changedByUserId: string
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        reservations: true,
      },
    });

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    let dbOrderStatus: OrderStatus = order.status;
    let dbPaymentStatus: PaymentStatus = order.paymentStatus;
    let dbDeliveryStatus: DeliveryStatus = order.deliveryStatus;

    const inputStatusLower = newStatus.toLowerCase();

    if (inputStatusLower === "pending") {
      dbOrderStatus = OrderStatus.PENDING;
      dbDeliveryStatus = DeliveryStatus.PENDING;
    } else if (inputStatusLower === "confirmed") {
      dbOrderStatus = OrderStatus.CONFIRMED;
      dbDeliveryStatus = DeliveryStatus.PENDING;
    } else if (inputStatusLower === "processing") {
      dbOrderStatus = OrderStatus.PROCESSING;
      dbDeliveryStatus = DeliveryStatus.PENDING;
    } else if (inputStatusLower === "packed") {
      dbOrderStatus = OrderStatus.PACKED;
      dbDeliveryStatus = DeliveryStatus.PENDING;
    } else if (inputStatusLower === "shipped") {
      dbOrderStatus = OrderStatus.SHIPPED;
      dbDeliveryStatus = DeliveryStatus.IN_TRANSIT;
    } else if (inputStatusLower === "out_for_delivery") {
      dbOrderStatus = OrderStatus.OUT_FOR_DELIVERY;
      dbDeliveryStatus = DeliveryStatus.IN_TRANSIT;
    } else if (inputStatusLower === "delivered") {
      dbOrderStatus = OrderStatus.DELIVERED;
      dbDeliveryStatus = DeliveryStatus.DELIVERED;
      dbPaymentStatus = PaymentStatus.PAID;
    } else if (inputStatusLower === "cancelled") {
      dbOrderStatus = OrderStatus.CANCELLED;
      dbDeliveryStatus = DeliveryStatus.FAILED;
    } else if (inputStatusLower === "returned") {
      dbOrderStatus = OrderStatus.RETURNED;
      dbDeliveryStatus = DeliveryStatus.RETURNED;
    } else if (inputStatusLower === "refunded") {
      if (order.status === OrderStatus.CANCELLED) {
        dbOrderStatus = OrderStatus.CANCELLED;
      } else {
        dbOrderStatus = OrderStatus.RETURNED;
      }
      dbPaymentStatus = PaymentStatus.REFUNDED;
      dbDeliveryStatus = DeliveryStatus.RETURNED;
    } else {
      throw new AppError(`Invalid order status: ${newStatus}`, 400);
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: dbOrderStatus,
        paymentStatus: dbPaymentStatus,
        deliveryStatus: dbDeliveryStatus,
      },
    });

    if (
      dbOrderStatus === OrderStatus.CANCELLED ||
      dbOrderStatus === OrderStatus.RETURNED ||
      dbPaymentStatus === PaymentStatus.REFUNDED
    ) {
      const reservations = await tx.stockReservation.findMany({
        where: {
          orderId,
          status: ReservationStatus.PENDING,
        },
      });

      for (const reservation of reservations) {
        await tx.inventory.update({
          where: { id: reservation.inventoryId },
          data: {
            quantityReserved: { decrement: reservation.quantity },
          },
        });

        await tx.stockReservation.update({
          where: { id: reservation.id },
          data: {
            status: ReservationStatus.CANCELLED,
          },
        });
      }
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: dbOrderStatus,
        changedByUserId,
        notes: notes || `Order status updated to ${newStatus} by admin.`,
      },
    });

    return tx.order.findUnique({
      where: { id: orderId },
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
  }, {
    timeout: 15000,
  });
}

export const assignDeliveryPartner = async (orderId: string, partnerId: string, userId: string, notes?: string) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError("Order not found", 404);

    const partner = await tx.deliveryPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new AppError("Delivery partner not found", 404);

    const assignment = await tx.orderAssignment.upsert({
      where: { orderId },
      update: {
        deliveryPartnerId: partnerId,
        assignedById: userId,
        status: AssignmentStatus.ASSIGNED,
        notes,
        assignedAt: new Date(),
      },
      create: {
        orderId,
        deliveryPartnerId: partnerId,
        assignedById: userId,
        status: AssignmentStatus.ASSIGNED,
        notes,
      }
    });

    await tx.order.update({
      where: { id: orderId },
      data: { deliveryStatus: DeliveryStatus.ASSIGNED }
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await tx.deliveryOTP.upsert({
      where: { orderId },
      update: {
        otp,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isUsed: false,
        attempts: 0,
      },
      create: {
        orderId,
        otp,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: order.status,
        changedByUserId: userId,
        notes: `Delivery assigned to partner ${partner.name}. Notes: ${notes || ''}`,
      }
    });

    return { assignment, generatedOtp: otp };
  });
};

export const verifyDeliveryOTP = async (orderId: string, otp: string, userId: string) => {
  return prisma.$transaction(async (tx) => {
    const deliveryOtp = await tx.deliveryOTP.findUnique({ where: { orderId } });
    if (!deliveryOtp) throw new AppError("OTP not generated for this order", 404);
    if (deliveryOtp.isUsed) throw new AppError("OTP already used", 400);
    if (deliveryOtp.expiresAt < new Date()) throw new AppError("OTP expired", 400);
    
    if (deliveryOtp.otp !== otp) {
      await tx.deliveryOTP.update({ where: { id: deliveryOtp.id }, data: { attempts: { increment: 1 } } });
      throw new AppError("Invalid OTP", 400);
    }

    await tx.deliveryOTP.update({
      where: { id: deliveryOtp.id },
      data: { isUsed: true, verifiedAt: new Date() }
    });

    await tx.order.update({
      where: { id: orderId },
      data: { 
        status: OrderStatus.DELIVERED,
        deliveryStatus: DeliveryStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
      }
    });

    await tx.orderAssignment.update({
      where: { orderId },
      data: { status: AssignmentStatus.DELIVERED, deliveredAt: new Date() }
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: OrderStatus.DELIVERED,
        changedByUserId: userId,
        notes: "Order delivered successfully via OTP verification.",
      }
    });

    return { verified: true, orderId };
  });
};
