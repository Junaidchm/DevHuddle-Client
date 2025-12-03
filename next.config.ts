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
        hostname: 'vkszksqfmg.ufs.sh',  // Your app-specific UploadThing subdomain
        pathname: '/f/**',             // Allow all files under /f/ path
      },
      
    ],
  },
};

export default nextConfig;


