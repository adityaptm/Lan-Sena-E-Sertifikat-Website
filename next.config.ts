import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Security: Menonaktifkan header x-powered-by
   * agar tidak mengekspos bahwa app menggunakan Next.js.
   */
  poweredByHeader: false,

  /**
   * Security: Redirect HTTP headers tambahan.
   * (Sebagian besar header diset di middleware.ts,
   * tapi ini sebagai fallback untuk static files.)
   */
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
  serverActions: {
    bodySizeLimit: "50mb",
  },
  experimental: {
    middlewareClientMaxBodySize: 50 * 1024 * 1024,
  },
};

export default nextConfig;
