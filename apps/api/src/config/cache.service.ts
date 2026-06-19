import { redis, checkRedisStatus } from "./redis";
import logger from "../shared/utils/logger";

/**
 * Gets a cached value from Redis.
 * If Redis is unavailable or the key does not exist, returns null.
 */
export async function get(key: string): Promise<string | null> {
  if (!checkRedisStatus() || !redis) return null;
  try {
    return await redis.get(key);
  } catch (error) {
    logger.error(`Cache get error for key "${key}":`, error);
    return null;
  }
}

/**
 * Sets a value in the Redis cache with a Time-To-Live (TTL) in seconds.
 * Fails silently if Redis is unavailable.
 */
export async function set(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (!checkRedisStatus() || !redis) return;
  try {
    await redis.set(key, value, "EX", ttlSeconds);
  } catch (error) {
    logger.error(`Cache set error for key "${key}":`, error);
  }
}

/**
 * Deletes a specific key from the Redis cache.
 * Fails silently if Redis is unavailable.
 */
export async function del(key: string): Promise<void> {
  if (!checkRedisStatus() || !redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    logger.error(`Cache delete error for key "${key}":`, error);
  }
}

/**
 * Scans and deletes all cache keys matching a specific pattern (e.g. "products:*").
 * Uses SCAN instead of KEYS to avoid blocking the single-threaded Redis process.
 * Fails silently if Redis is unavailable.
 */
export async function clearPattern(pattern: string): Promise<void> {
  if (!checkRedisStatus() || !redis) return;
  try {
    logger.info(`Invalidating cache pattern: ${pattern}`);
    let cursor = "0";
    do {
      const reply = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = reply[0];
      const keys = reply[1];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    logger.error(`Cache clearPattern error for pattern "${pattern}":`, error);
  }
}
