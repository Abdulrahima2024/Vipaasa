import { Request, Response, NextFunction } from "express";
import { verifyCaptcha } from "../../modules/auth/hcaptcha.service";
import logger from "../utils/logger";

/**
 * Middleware to enforce hCaptcha validation.
 * Rejects requests with missing or invalid hCaptcha tokens.
 */
export async function validateCaptcha(req: Request, res: Response, next: NextFunction) {
  try {
    // Read from body or header
    const captchaToken = req.body.captchaToken || req.headers["x-captcha-token"];

    // Bypass check if HCAPTCHA_SECRET_KEY is not configured in this environment
    if (!process.env.HCAPTCHA_SECRET_KEY) {
      return next();
    }

    if (!captchaToken || typeof captchaToken !== "string") {
      logger.warn("Request rejected: Missing hCaptcha verification token");
      return res.status(400).json({ error: "hCaptcha verification token is required" });
    }

    const isValid = await verifyCaptcha(captchaToken);
    if (!isValid) {
      logger.warn("Request rejected: Invalid or expired hCaptcha verification token");
      return res.status(400).json({ error: "hCaptcha token verification failed or expired" });
    }

    next();
  } catch (error) {
    logger.error("Error in validateCaptcha middleware:", error);
    return res.status(500).json({ error: "Internal server error during captcha validation" });
  }
}
