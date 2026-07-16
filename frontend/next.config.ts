import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;