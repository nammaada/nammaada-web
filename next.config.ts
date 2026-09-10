import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16: Cache Components enables Partial Prerendering (PPR) as default behaviour.
  // It preserves component state during navigation using React's <Activity> so the UI
  // appears instantly on back/forward — no full re-render waterfall.
  cacheComponents: true,

  // Partial Prefetching prefetches a single reusable App Shell per route instead of
  // one prefetch per visible <Link>. This drastically cuts prefetch request volume and
  // makes first-click navigation feel near-instant. Requires cacheComponents: true.
  partialPrefetching: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
