import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_OUTPUT_EXPORT === "1" || Boolean(process.env.PAGES_BASE_PATH);

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: process.env.PAGES_BASE_PATH || "",
};

export default nextConfig;
