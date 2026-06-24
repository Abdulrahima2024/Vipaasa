/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix the workspace root detection warning
  outputFileTracingRoot: require("path").join(__dirname, "../../"),

  // Disable type checking and linting during build to save memory
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Reduce memory pressure during development
      config.optimization = {
        ...config.optimization,
        // Minimize chunk splitting to reduce memory overhead
        splitChunks: false,
        runtimeChunk: false,
      };

      // Limit parallelism to reduce memory usage
      config.parallelism = 1;

      // Reduce snapshot management overhead
      config.snapshot = {
        ...(config.snapshot || {}),
        managedPaths: [],
      };
    }

    return config;
  },
};

module.exports = nextConfig;
