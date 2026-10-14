import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Turbopack due to PostCSS compatibility issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
