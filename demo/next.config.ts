import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Turbopack is now the default bundler in Next.js 16
  turbopack: {},
  images: {
    remotePatterns: [
      // NextJS <Image> component needs to whitelist domains for src={}
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "logos-world.net",
      },
    ],
  },
};

export default nextConfig;
