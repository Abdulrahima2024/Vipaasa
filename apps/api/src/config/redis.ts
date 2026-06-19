import Redis from "ioredis";
import logger from "../shared/utils/logger";

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;
let isRedisAvailable = false;

if (redisUrl) {
  try {
    logger.info("Initializing Redis client...");
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true, // Connect on-demand/async to avoid blocking server boot
    });

    redis.on("connect", () => {
      logger.info("Successfully connected to Redis instance.");
      isRedisAvailable = true;
    });

    redis.on("ready", () => {
      isRedisAvailable = true;
    });

    redis.on("error", (error) => {
      logger.error("Redis client connection error:", error);
      isRedisAvailable = false;
    });

    redis.on("close", () => {
      logger.warn("Redis client connection closed.");
      isRedisAvailable = false;
    });

    // Start connection
    redis.connect().catch((error) => {
      logger.error("Failed to connect to Redis during boot:", error);
      isRedisAvailable = false;
    });
  } catch (error) {
    logger.error("Error setting up Redis client instance:", error);
    redis = null;
    isRedisAvailable = false;
  }
} else {
  logger.warn("REDIS_URL is not set in environment. Redis features will fall back to PostgreSQL.");
}

/**
 * Checks if the Redis client is initialized, connected, and ready to receive commands.
 */
export function checkRedisStatus(): boolean {
  return redis !== null && isRedisAvailable && redis.status === "ready";
}

export { redis };
