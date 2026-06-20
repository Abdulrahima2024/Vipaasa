import jwt from "jsonwebtoken";
import { redis, checkRedisStatus } from "../../config/redis";
import { prisma } from "../../config/database";
import logger from "../../shared/utils/logger";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "vipaasa_default_jwt_access_secret_key_1234567890";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "vipaasa_default_jwt_refresh_secret_key_0987654321";

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "30d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY as any });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY as any });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Stores refresh token in Redis and PostgreSQL
 */
export async function storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
  // Store in PostgreSQL
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  // Store in Redis (under refresh:{userId} set)
  if (checkRedisStatus() && redis) {
    const key = `refresh:${userId}`;
    const ttlSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    try {
      await redis.sadd(key, token);
      if (ttlSeconds > 0) {
        await redis.expire(key, ttlSeconds);
      }
      logger.info(`Refresh token stored in Redis for user: ${userId}`);
    } catch (error) {
      logger.error(`Failed to store refresh token in Redis for user ${userId}:`, error);
    }
  }
}

/**
 * Validates if the refresh token is active and not revoked/expired
 */
export async function isRefreshTokenValid(userId: string, token: string): Promise<boolean> {
  // Try Redis first
  if (checkRedisStatus() && redis) {
    const key = `refresh:${userId}`;
    try {
      const isMember = await redis.sismember(key, token);
      if (isMember === 1) {
        return true;
      }
      
      const keyExists = await redis.exists(key);
      if (keyExists === 1) {
        // Redis set exists, but token is not in it -> invalid
        return false;
      }
    } catch (error) {
      logger.error(`Redis isRefreshTokenValid error for user ${userId}:`, error);
    }
  }

  // Fallback: PostgreSQL
  const record = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!record || record.userId !== userId || record.isRevoked || record.expiresAt < new Date()) {
    return false;
  }

  // If found in PostgreSQL and valid, sync it back to Redis
  if (checkRedisStatus() && redis) {
    const key = `refresh:${userId}`;
    const ttlSeconds = Math.max(0, Math.floor((record.expiresAt.getTime() - Date.now()) / 1000));
    try {
      await redis.sadd(key, token);
      if (ttlSeconds > 0) {
        await redis.expire(key, ttlSeconds);
      }
    } catch (e) {
      logger.error("Failed to sync valid refresh token back to Redis:", e);
    }
  }

  return true;
}

/**
 * Revokes a specific refresh token (single device logout)
 */
export async function revokeRefreshToken(userId: string, token: string): Promise<void> {
  // Revoke in PostgreSQL
  await prisma.refreshToken.updateMany({
    where: { token },
    data: {
      isRevoked: true,
    },
  }).catch((e) => logger.error("Failed to revoke refresh token in database:", e));

  // Revoke in Redis
  if (checkRedisStatus() && redis) {
    const key = `refresh:${userId}`;
    try {
      await redis.srem(key, token);
      logger.info(`Refresh token removed from Redis for user: ${userId}`);
    } catch (error) {
      logger.error(`Failed to remove refresh token from Redis for user ${userId}:`, error);
    }
  }
}

/**
 * Revokes all refresh tokens for a user (force logout from all devices)
 */
export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  // Revoke in PostgreSQL
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: {
      isRevoked: true,
    },
  }).catch((e) => logger.error("Failed to revoke all refresh tokens in database:", e));

  // Revoke in Redis
  if (checkRedisStatus() && redis) {
    const key = `refresh:${userId}`;
    try {
      await redis.del(key);
      logger.info(`All refresh tokens removed from Redis for user: ${userId}`);
    } catch (error) {
      logger.error(`Failed to clear refresh tokens from Redis for user ${userId}:`, error);
    }
  }
}

/**
 * Rotates a refresh token: generates a new pair and revokes the old one.
 * Uses reuse detection: if a revoked or missing refresh token is used,
 * we assume a breach and revoke all active sessions for the user.
 */
export async function rotateRefreshToken(
  oldToken: string
): Promise<{ accessToken: string; refreshToken: string; payload: TokenPayload } | null> {
  // 1. Verify token signature and retrieve payload
  const payload = verifyRefreshToken(oldToken);
  if (!payload) {
    return null;
  }

  // 2. Validate token state
  const isValid = await isRefreshTokenValid(payload.userId, oldToken);
  if (!isValid) {
    // SECURITY RISK: Token reuse or invalid token presented!
    // Check if the token exists in the database but is already marked as revoked
    const record = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
    });

    if (record && record.isRevoked) {
      logger.warn(`SECURITY ALERT: Revoked refresh token reuse detected for user ${payload.userId}! Revoking all sessions.`);
      await revokeAllRefreshTokens(payload.userId);
    }
    return null;
  }

  // 3. Generate new tokens
  const newAccessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });

  const newRefreshToken = generateRefreshToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });

  // 4. Calculate expiry date for the new refresh token (e.g. 30 days from now)
  const decodedNew = jwt.decode(newRefreshToken) as { exp: number };
  const expiresAt = decodedNew ? new Date(decodedNew.exp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // 5. Transactional updates: Store new token and revoke old one
  await storeRefreshToken(payload.userId, newRefreshToken, expiresAt);
  await revokeRefreshToken(payload.userId, oldToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    payload,
  };
}
