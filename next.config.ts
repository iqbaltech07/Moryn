import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/generate",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/preview",
        destination: "/prd",
        permanent: true,
      },
      {
        source: "/detail",
        destination: "/design",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
