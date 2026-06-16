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

const handlePrismaError = (err: any) => {
  if (err.code === "P2002") {
    const fields = err.meta?.target || "fields";
    return new AppError(`Duplicate field value for ${fields}. Please use another value!`, 400);
  }
  if (err.code === "P2025") {
    return new AppError(err.meta?.cause || "Record not found", 404);
  }
  return new AppError(`Database error: ${err.message}`, 400);
};

const handleZodError = (err: ZodError) => {
  const errors = err.issues.map((e: ZodIssue) => ({
    field: e.path.join("."),
    message: e.message,
  }));
  const message = `Validation failed: ${err.issues.map((e: ZodIssue) => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
  const error = new AppError(message, 400);
  (error as any).errors = errors;
  return error;
};

const handleJWTError = () => new AppError("Invalid token. Please log in again!", 401);
const handleJWTExpiredError = () => new AppError("Your token has expired! Please log in again.", 401);

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
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    error.name = err.name;
    error.code = err.code;

    if (err instanceof ZodError) {
      error = handleZodError(err);
    } else if (error.name === "PrismaClientKnownRequestError" || error.code?.startsWith("P")) {
      error = handlePrismaError(err);
    } else if (error.name === "JsonWebTokenError") {
      error = handleJWTError();
    } else if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};
