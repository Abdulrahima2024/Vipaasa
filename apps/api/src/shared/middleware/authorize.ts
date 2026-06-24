import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";

export function authorize(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Access denied. User not authenticated." });
      }

      console.log("AUTHORIZE MIDDLEWARE DEBUG:", { userRole: req.user?.role, allowedRoles });
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied. Insufficient permissions." });
      }

      next();
    } catch (error) {
      console.error("Authorization middleware error:", error);
      return res.status(500).json({ error: "Internal server error during authorization." });
    }
  };
}
