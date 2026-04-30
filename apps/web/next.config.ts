import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@taskloop/shared"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false
    };

    return config;
  }
};

export default nextConfig;
