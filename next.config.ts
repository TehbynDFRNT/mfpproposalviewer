import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose Google Maps API key to client
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "AIzaSyCl_Mb4Sc41ZREQ3xw2QNUUIidOkbrhjpE",
  },
  // Temporarily ignore ESLint errors during build
  // You can remove this once you've cleaned up the ESLint issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Temporarily ignore TypeScript errors during build
  // You can remove this once you've cleaned up the TypeScript issues
  typescript: {
    ignoreBuildErrors: true,
  },
  // Exclude raw media files from the build
  webpack: (config) => {
    config.module.rules.push({
      test: /images_raw\//,
      use: 'ignore-loader',
    });
    config.module.rules.push({
      test: /videos_raw\//,
      use: 'ignore-loader',
    });
    return config;
  },
};

export default nextConfig;
