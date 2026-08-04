import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "development" ? undefined : "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: process.env.PAGES_BASE_PATH || "",
};

export default nextConfig;
