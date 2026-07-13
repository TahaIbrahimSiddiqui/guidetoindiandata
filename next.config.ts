import type { NextConfig } from "next";

/** Project site: https://tahaibrahim.in/guidetoindiandata/ */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/guidetoindiandata";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
