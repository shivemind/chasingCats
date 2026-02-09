import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors/warnings. Fix these gradually.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: Dangerously allow production builds to complete even if
    // your project has type errors. Only enable temporarily if needed.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
