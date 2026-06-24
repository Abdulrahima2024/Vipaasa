import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as orderService from "./order.service";
import { CheckoutRequestSchema, OrderParamSchema } from "./order.schema";
import { AppError } from "../../shared/middleware/errorHandler";
import { acquireCheckoutLock, releaseCheckoutLock } from "./checkoutLock.service";

/**
 * Handles order checkout request.
 * POST /checkout
 */
export async function checkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const validation = CheckoutRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const hasLock = await acquireCheckoutLock(userId, 15);
    if (!hasLock) {
      throw new AppError("Another checkout request is currently processing. Please wait.", 409);
    }

    try {
      const order = await orderService.checkout(userId, validation.data);

      return res.status(201).json({
        status: "success",
        data: order,
      });
    } finally {
      await releaseCheckoutLock(userId);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Handles fetching orders for the authenticated customer.
 * GET /orders
 */
export async function getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const orders = await orderService.getOrders(userId);

    return res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles fetching details of a specific order.
 * GET /orders/:id
 */
export async function getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const paramValidation = OrderParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: paramValidation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const order = await orderService.getOrderById(userId, paramValidation.data.id);

    return res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles cancelling a pending order.
 * PATCH /orders/:id/cancel
 */
export async function cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const paramValidation = OrderParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: paramValidation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const cancelledOrder = await orderService.cancelOrder(userId, paramValidation.data.id);

    return res.status(200).json({
      status: "success",
      message: "Order successfully cancelled.",
      data: cancelledOrder,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles fetching all orders for admin dashboard.
 * GET /admin/orders
 */
export async function getAdminOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getAdminOrders();
    return res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles fetching order statistics for admin dashboard.
 * GET /admin/orders/stats
 */
export async function getAdminOrderStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const stats = await orderService.getAdminOrderStats();
    return res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles updating an order status by admin.
 * PATCH /admin/orders/:id/status
 */
export async function updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized. User session not found.", 401);
    }

    const { id: orderId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      throw new AppError("Status is required.", 400);
    }

    const updatedOrder = await orderService.updateOrderStatusAdmin(orderId, status, notes, userId);

    return res.status(200).json({
      status: "success",
      message: `Order status successfully updated to ${status}.`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
}

export async function assignDelivery(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { id: orderId } = req.params;
    const { partnerId, notes } = req.body;

    if (!partnerId) throw new AppError("Partner ID is required", 400);

    const result = await orderService.assignDeliveryPartner(orderId, partnerId, userId, notes);

    return res.status(200).json({
      status: "success",
      message: "Delivery partner assigned successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyDelivery(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { id: orderId } = req.params;
    const { otp } = req.body;

    if (!otp) throw new AppError("OTP is required", 400);

    const result = await orderService.verifyDeliveryOTP(orderId, otp, userId);

    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully. Order delivered.",
      data: result
    });
  } catch (error) {
    next(error);
  }
}
