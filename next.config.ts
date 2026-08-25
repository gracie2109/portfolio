import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  eslint: {
    // Phase 0/1 only scaffolds + auth/i18n; most existing .jsx components
    // (not yet converted to .tsx, still importing react-router-dom, etc.)
    // fail eslint-config-next's rules until Phase 2/3 converts them.
    // `npm run lint` still surfaces these — only `next build` skips them.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
