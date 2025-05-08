import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://picsum.photos/**'), new URL("https://okwtyfgqkhtwiouamzid.supabase.co/**")],
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
