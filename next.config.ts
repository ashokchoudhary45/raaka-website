import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Keep the Turso WebSocket compatibility package out of the OpenNext bundle.
  serverExternalPackages: ["@libsql/isomorphic-ws"],
  // ⚡ Better production performance
  poweredByHeader: false,

  // 🖼️ Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // 📦 Compression
  compress: true,

  // 🔗 SEO / clean URLs
  trailingSlash: false,
};

// ☁️ Enable Cloudflare bindings (D1/R2/etc.) during `next dev`
initOpenNextCloudflareForDev();

export default nextConfig;