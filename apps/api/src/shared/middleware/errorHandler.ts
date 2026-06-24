import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import logger from "../utils/logger";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  } else {
    logger.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Normalize Prisma/database errors before env-specific formatting
  if (err.name === "PrismaClientKnownRequestError" || err.code?.startsWith("P")) {
    if (err.code === "P2002") {
      const fields = err.meta?.target || "fields";
      err.statusCode = 400;
      err.message = `Duplicate field value for ${fields}. Please use another value!`;
    } else if (err.code === "P2025") {
      err.statusCode = 404;
      err.message = err.meta?.cause || "Record not found";
    } else {
      err.statusCode = err.statusCode || 400;
      err.message = `Database error: ${err.message}`;
    }
  } else if (err instanceof ZodError) {
    const errors = err.issues.map((e: ZodIssue) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    (err as any).statusCode = 400;
    (err as any).message = `Validation failed: ${err.issues.map((e: ZodIssue) => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
    (err as any).errors = errors;
  } else if (err.name === "JsonWebTokenError") {
    err.statusCode = 401;
    err.message = "Invalid token. Please log in again!";
  } else if (err.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.message = "Your token has expired! Please log in again.";
  }

  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith("4") ? "fail" : "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};
