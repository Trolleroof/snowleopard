import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Also ignore TypeScript errors during builds (optional)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
