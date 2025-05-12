import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Read Google Maps API key from environment variables
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
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
  // Configure image domains - allow Supabase storage URLs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mapshmozorhiewusdgor.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Add a wildcard pattern to handle any Supabase instance
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Exclude raw media files from the build and provide Node.js polyfills
  webpack: (config) => {
    config.module.rules.push({
      test: /images_raw\//,
      use: 'ignore-loader',
    });
    config.module.rules.push({
      test: /videos_raw\//,
      use: 'ignore-loader',
    });

    // Provide polyfills for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      stream: require.resolve('stream-browserify'),
    };

    return config;
  },
};

export default nextConfig;
