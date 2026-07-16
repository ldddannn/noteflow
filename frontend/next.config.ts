import type { NextConfig } from "next";
import { withCloudflarePages } from "@cloudflare/next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/api/:path*",
        },
      ];
    }
    return [];
  },
  experimental: {
    optimizeCss: true,
  },
};

export default withCloudflarePages(nextConfig);