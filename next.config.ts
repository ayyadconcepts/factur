import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: './src/lib/empty.ts',
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      canvas: './src/lib/empty.ts', // Stub out canvas for pdf.js in Turbopack
    },
  },
  serverExternalPackages: ['@stafyniaksacha/facturx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
