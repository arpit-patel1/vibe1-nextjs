import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Ensure static assets are properly handled
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : undefined,
  // Configure image optimization
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
};

export default nextConfig;
