import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;