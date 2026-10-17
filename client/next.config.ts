import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.195'],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
      "date-fns",
      "streamdown",
      "@streamdown/code",
    ],
  },
};

export default nextConfig;
