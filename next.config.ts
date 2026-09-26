import type { NextConfig } from "next";

// The browser talks to the backend only through this same-origin proxy, which
// removes CORS from the equation and keeps the backend URL server-side.
const API_URL = process.env.DEEVI_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/bff/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
  images: {
    // Supabase storage / signed URLs may return images from arbitrary hosts.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
