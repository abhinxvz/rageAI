import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // We run type checking separately
    ignoreBuildErrors: false,
  },
  experimental: {
    // Optimize memory usage
    workerThreads: false,
    cpus: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'bhindi.io',
      },
    ],
  },
};

export default nextConfig;
