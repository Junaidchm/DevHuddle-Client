import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env:{
    LOCAL_APIGATEWAY_URL:process.env.LOCAL_APIGATEWAY_URL
  }
};

export default nextConfig;
