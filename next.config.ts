import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "evjzlqctrkhjdgytfyhi.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
