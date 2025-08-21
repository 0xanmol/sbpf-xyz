import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Silence workspace root warning when multiple lockfiles exist above the app root
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
