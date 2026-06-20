import logger from "../../shared/utils/logger";

/**
 * Verifies the hCaptcha token with the hCaptcha siteverify API.
 * Handles local dev bypass gracefully if HCAPTCHA_SECRET_KEY is missing.
 */
export async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.HCAPTCHA_SECRET_KEY || "";
  if (!secretKey) {
    logger.warn("HCAPTCHA_SECRET_KEY is not set. Bypassing hCaptcha verification in local development mode.");
    return true;
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token);

    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      logger.error(`hCaptcha siteverify API returned non-OK status: ${response.status}`);
      return false;
    }

    const data = await response.json() as { success: boolean; "error-codes"?: string[] };
    
    if (data.success) {
      return true;
    }

    // Gracefully handle test keys / mismatch in non-production environments to avoid blocking developers
    if (process.env.NODE_ENV !== "production") {
      const errorCodes = data["error-codes"] || [];
      const isDummyOrMismatch = errorCodes.some(code => 
        code === "not-using-dummy-secret" || 
        code === "sitekey-secret-mismatch" || 
        code === "invalid-input-response"
      );
      if (isDummyOrMismatch) {
        logger.warn(`hCaptcha verification failed in development with error codes: ${JSON.stringify(errorCodes)}. Bypassing to allow local development testing.`);
        return true;
      }
    }

    logger.warn(`hCaptcha verification failed. Error codes: ${JSON.stringify(data["error-codes"])}`);
    return false;
  } catch (error) {
    logger.error("Error verifying hCaptcha token:", error);
    return false;
  }
}
