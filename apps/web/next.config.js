/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Compiler optimisations ─────────────────────────────────────────────────
  compiler: {
    // Remove console.log in production builds
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ── Image optimisation ─────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],    // AVIF first (50% smaller than WebP)
    qualities: [60, 75, 85, 100],
    minimumCacheTTL: 60 * 60 * 24 * 7,       // 7-day CDN cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "www.amazon.in" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google OAuth avatars
      { protocol: "https", hostname: "*.amazonaws.com" },            // AWS S3
      { protocol: "https", hostname: "*.cloudfront.net" },           // AWS CloudFront CDN
    ],
  },

  // ── Security headers ───────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",       value: "nosniff" },
          { key: "X-Frame-Options",               value: "DENY" },
          { key: "X-XSS-Protection",              value: "1; mode=block" },
          { key: "Referrer-Policy",               value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",            value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // Aggressive caching for static assets
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ── Redirects ──────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect /shop to /categories
      {
        source: "/shop",
        destination: "/categories",
        permanent: true,
      },
    ];
  },

  // ── Bundle analyser (run with ANALYZE=true npm run build) ─────────────────
  ...(process.env.ANALYZE === "true"
    ? { experimental: {} }
    : {}),
};

module.exports = nextConfig;
