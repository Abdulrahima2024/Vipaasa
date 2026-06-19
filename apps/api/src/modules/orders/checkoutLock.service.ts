import { redis, checkRedisStatus } from "../../config/redis";
import logger from "../../shared/utils/logger";

/**
 * Attempts to acquire a distributed checkout lock for a user in Redis.
 * Uses SET key value NX EX ttl to guarantee atomic mutual exclusion.
 * 
 * @param userId - The user trying to check out
 * @param ttlSeconds - The duration before the lock automatically expires
 * @returns boolean - True if lock is acquired (or if Redis is unavailable and we fall back to DB), false if lock is already held.
 */
export async function acquireCheckoutLock(userId: string, ttlSeconds: number = 10): Promise<boolean> {
  if (!checkRedisStatus() || !redis) {
    logger.warn(`Redis is unavailable. Bypassing checkout lock for user ${userId} to fall back to DB row-locking.`);
    return true; // Fallback: allow request to proceed so PostgreSQL transaction handles locking
  }

  const lockKey = `lock:checkout:${userId}`;
  try {
    const result = await redis.set(lockKey, "locked", "EX", ttlSeconds, "NX");
    return result === "OK";
  } catch (error) {
    logger.error(`Failed to acquire checkout lock in Redis for user ${userId}:`, error);
    return true; // Fallback: default to true on error so checkout doesn't fail
  }
}

/**
 * Releases the distributed checkout lock for a user in Redis.
 */
export async function releaseCheckoutLock(userId: string): Promise<void> {
  if (!checkRedisStatus() || !redis) return;

  const lockKey = `lock:checkout:${userId}`;
  try {
    await redis.del(lockKey);
  } catch (error) {
    logger.error(`Failed to release checkout lock in Redis for user ${userId}:`, error);
  }
}
