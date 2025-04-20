import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose Google Maps API key to client
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "AIzaSyCl_Mb4Sc41ZREQ3xw2QNUUIidOkbrhjpE",
  },
  /* other config options here */
};

export default nextConfig;
