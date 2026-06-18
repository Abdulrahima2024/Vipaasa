import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Access denied. Invalid token format." });
    }

    const secret = process.env.JWT_ACCESS_SECRET || "vipaasa_default_jwt_access_secret_key_1234567890";
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(401).json({ error: "Access denied. Invalid or expired token." });
  }
}

export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next();
    }

    const secret = process.env.JWT_ACCESS_SECRET || "vipaasa_default_jwt_access_secret_key_1234567890";
    try {
      const decoded = jwt.verify(token, secret) as {
        userId: string;
        email: string;
        role: string;
      };
      req.user = decoded;
    } catch (err) {
      console.warn("Optional authentication token verify failed:", err);
    }
    next();
  } catch (error) {
    console.error("Optional authentication middleware error:", error);
    next();
  }
}
