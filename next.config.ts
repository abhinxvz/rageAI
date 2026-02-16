import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    // We run ESLint in pre-commit hooks instead
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We run type checking separately
    ignoreBuildErrors: false,
  },
  experimental: {
    // Optimize memory usage
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
