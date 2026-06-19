import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as orderService from "./order.service";
import { CheckoutRequestSchema, OrderParamSchema } from "./order.schema";
import { AppError } from "../../shared/middleware/errorHandler";

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

    const order = await orderService.checkout(userId, validation.data);

    return res.status(201).json({
      status: "success",
      data: order,
    });
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
