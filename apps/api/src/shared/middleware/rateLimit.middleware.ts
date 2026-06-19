import { Request, Response, NextFunction } from "express";
import { redis, checkRedisStatus } from "../../config/redis";
import logger from "../utils/logger";
import { AppError } from "./errorHandler";

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix: string;
}

/**
 * Creates an Express middleware for rate limiting using Redis.
 * If Redis is down, requests are allowed to proceed (fail open).
 */
export function createRedisRateLimiter(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Fail-open if Redis is down
    if (!checkRedisStatus() || !redis) {
      logger.warn(`Redis is unavailable. Bypassing rate limiter "${options.keyPrefix}" for IP ${req.ip}`);
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const key = `rate_limit:${options.keyPrefix}:${ip}`;

    try {
      // Use multi to execute increment and expire in a single atomic transaction
      const multi = redis.multi();
      multi.incr(key);
      multi.ttl(key);
      
      const results = await multi.exec();
      if (!results || results.length < 2) {
        return next();
      }

      const currentCount = results[0][1] as number;
      const ttl = results[1][1] as number;

      // If it's a new key, set the expiry
      if (currentCount === 1 || ttl === -1) {
        await redis.expire(key, options.windowSeconds);
      }

      if (currentCount > options.maxRequests) {
        logger.warn(`Rate limit exceeded for IP ${ip} on "${options.keyPrefix}". Request count: ${currentCount}/${options.maxRequests}`);
        return next(
          new AppError(
            `Too many requests. Please try again after ${options.windowSeconds} seconds.`,
            429
          )
        );
      }

      next();
    } catch (error) {
      logger.error(`Error in Redis rate limiter middleware for "${options.keyPrefix}":`, error);
      next(); // Fail open on error
    }
  };
}
