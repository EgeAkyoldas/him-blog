import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
=======
  output: "standalone",
>>>>>>> 44570a8debab986e7af5daa7d16d3cedf6fde83a
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
