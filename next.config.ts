import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    LOCAL_APIGATEWAY_URL: process.env.LOCAL_APIGATEWAY_URL,
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'devhuddle-bucket-junaid.s3.ap-south-1.amazonaws.com',  // S3 bucket for profile images
        pathname: '/**',                // Allow all paths
      },
      {
        protocol: 'https',
        hostname: '*.s3.ap-south-1.amazonaws.com',  // Any S3 bucket in ap-south-1 region
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',  // Any S3 bucket in any region
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',  // Cloudflare R2 for media
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',  // Cloudflare R2 public URLs
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;


