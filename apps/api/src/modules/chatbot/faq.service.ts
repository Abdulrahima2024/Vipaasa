import { prisma } from "../../config/database";
import { redis, checkRedisStatus } from "../../config/redis";
import logger from "../../shared/utils/logger";

/**
 * Retrieves an FAQ answer from Redis cache or PostgreSQL database.
 * Caches database results in Redis for 24 hours.
 */
export async function getFAQResponse(question: string): Promise<string> {
  const normalizedQuestion = question.trim().toLowerCase();
  const cacheKey = `faq:${normalizedQuestion}`;

  // 1. Check Redis cache if online
  try {
    if (checkRedisStatus() && redis) {
      const cachedResponse = await redis.get(cacheKey);
      if (cachedResponse) {
        logger.info(`FAQ cache hit for: "${normalizedQuestion}"`);
        return cachedResponse;
      }
    }
  } catch (error) {
    logger.error(`Error querying Redis cache for FAQ "${normalizedQuestion}":`, error);
    // Fall back to database on cache error
  }

  // 2. Query database (case-insensitive)
  const faq = await prisma.fAQ.findFirst({
    where: {
      question: {
        equals: normalizedQuestion,
        mode: "insensitive",
      },
    },
  });

  if (faq) {
    // 3. Cache FAQ response in Redis with 24 hours TTL
    try {
      if (checkRedisStatus() && redis) {
        await redis.set(cacheKey, faq.answer, "EX", 24 * 60 * 60);
        logger.info(`FAQ cached in Redis for: "${normalizedQuestion}"`);
      }
    } catch (error) {
      logger.error(`Error caching FAQ response in Redis for "${normalizedQuestion}":`, error);
      // Fail open (do not block the user if cache write fails)
    }
    return faq.answer;
  }

  // 4. Default fallback answer if question is not in DB
  return "Please contact with phone number: +91 99887 76655";
}
