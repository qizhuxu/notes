import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cloudflare Pages 部署使用 next-on-pages 构建，无需指定 output */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
