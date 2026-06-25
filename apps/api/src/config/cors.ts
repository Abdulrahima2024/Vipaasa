export const isOriginAllowed = (origin: string | undefined): boolean => {
  // Allow requests with no origin (e.g., mobile apps, curl, postman, server-to-server)
  if (!origin) {
    return true;
  }

  // Load explicitly configured origins dynamically to avoid initialization order issues
  const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : [];
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    const port = url.port;

    // Allow ports 3000, 3001, 3002, and any port in the 4000 range (4000-4999)
    if (port === "3000" || port === "3001" || port === "3002" || /^4\d{3}$/.test(port)) {
      return true;
    }
  } catch (error) {
    // Treat invalid URLs as invalid origins
  }

  return false;
};
