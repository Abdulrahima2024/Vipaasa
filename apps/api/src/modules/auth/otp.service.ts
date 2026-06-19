import bcrypt from "bcryptjs";
import { redis, checkRedisStatus } from "../../config/redis";
import { prisma } from "../../config/database";
import logger from "../../shared/utils/logger";

/**
 * Stores a pending OTP code hash in Redis.
 * If Redis is unavailable, falls back to saving it in PostgreSQL.
 * 
 * @param email - The recipient email
 * @param codeHash - The bcrypt hash of the OTP code
 * @param purpose - The purpose of the OTP (e.g. "EMAIL_VERIFICATION", "PASSWORD_RESET")
 * @param userId - Optional user ID associated with the OTP
 */
export async function saveOtp(
  email: string,
  codeHash: string,
  purpose: string,
  userId: string | null = null
): Promise<void> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

  if (checkRedisStatus() && redis) {
    const key = `otp:${purpose}:pending:${email}`;
    try {
      await redis.set(key, JSON.stringify({ codeHash, userId }), "EX", 300); // 5 minutes TTL
      logger.info(`OTP hash stored in Redis for ${email} (${purpose})`);
      return;
    } catch (error) {
      logger.error(`Failed to save OTP in Redis for ${email}:`, error);
    }
  }

  // Fallback: Save to PostgreSQL
  logger.info(`Falling back to PostgreSQL to store OTP for ${email}`);
  await prisma.otpVerification.deleteMany({
    where: { email, purpose }
  });

  await prisma.otpVerification.create({
    data: {
      userId,
      email,
      codeHash,
      purpose,
      expiresAt,
      isVerified: false
    }
  });
}

/**
 * Verifies an OTP code against the pending cache or database.
 * If verified successfully, deletes the pending code (one-time use) and marks it as verified.
 * 
 * @returns boolean - True if verification succeeds, false otherwise.
 */
export async function verifyOtpCode(
  email: string,
  otp: string,
  purpose: string
): Promise<boolean> {
  // Try Redis first
  if (checkRedisStatus() && redis) {
    const pendingKey = `otp:${purpose}:pending:${email}`;
    try {
      const dataStr = await redis.get(pendingKey);
      if (dataStr) {
        const { codeHash } = JSON.parse(dataStr);
        const matches = await bcrypt.compare(otp, codeHash);
        if (matches) {
          // Success: delete pending code and store verified status
          await redis.del(pendingKey);
          
          const verifiedKey = `otp:${purpose}:verified:${email}`;
          await redis.set(verifiedKey, "true", "EX", 300); // 5 minutes TTL to complete action
          
          logger.info(`OTP successfully verified via Redis for ${email} (${purpose})`);
          return true;
        }
        return false;
      }
    } catch (error) {
      logger.error(`Redis OTP verification failed, falling back to DB for ${email}:`, error);
    }
  }

  // Fallback: Verify via PostgreSQL
  logger.info(`Looking up OTP in PostgreSQL for verification: ${email}`);
  const verification = await prisma.otpVerification.findFirst({
    where: {
      email,
      purpose,
      isVerified: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!verification) return false;

  const matches = await bcrypt.compare(otp, verification.codeHash);
  if (!matches) return false;

  // Mark record as verified in DB
  await prisma.otpVerification.update({
    where: { id: verification.id },
    data: { isVerified: true }
  });

  // If Redis becomes available, also set the verified state in Redis for next steps
  if (checkRedisStatus() && redis) {
    try {
      await redis.set(`otp:${purpose}:verified:${email}`, "true", "EX", 300);
    } catch (e) {
      logger.error("Failed to sync verified OTP state to Redis:", e);
    }
  }

  return true;
}

/**
 * Consumes the verified OTP status to check if the user is authorized to perform the reset/action.
 * If authorized, clears the verified marker immediately (one-time use).
 * 
 * @returns boolean - True if verified marker exists/valid, false otherwise.
 */
export async function consumeVerifiedOtp(
  email: string,
  purpose: string
): Promise<boolean> {
  // Try Redis first
  if (checkRedisStatus() && redis) {
    const verifiedKey = `otp:${purpose}:verified:${email}`;
    try {
      const exists = await redis.get(verifiedKey);
      if (exists === "true") {
        await redis.del(verifiedKey); // One-time use: consume it immediately
        
        // Also clean up any lingering PostgreSQL records just in case
        await prisma.otpVerification.deleteMany({
          where: { email, purpose }
        }).catch(() => {});

        logger.info(`Verified OTP consumed via Redis for ${email} (${purpose})`);
        return true;
      }
    } catch (error) {
      logger.error(`Failed to check/consume verified OTP in Redis for ${email}:`, error);
    }
  }

  // Fallback: Check PostgreSQL
  logger.info(`Checking PostgreSQL for verified OTP: ${email}`);
  const verification = await prisma.otpVerification.findFirst({
    where: {
      email,
      purpose,
      isVerified: true
    },
    orderBy: { updatedAt: "desc" }
  });

  if (!verification) return false;

  // Consume/Delete the verified records in DB
  await prisma.otpVerification.deleteMany({
    where: { email, purpose }
  });

  return true;
}
