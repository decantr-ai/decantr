import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@decantr/registry'],
  rewrites: async () => [
    {
      source: '/showcase/:path*',
      destination: '/showcase/index.html',
    },
  ],
  redirects: async () => [
    {
      source: '/registry',
      destination: '/',
      permanent: true,
    },
    {
      source: '/registry/:path*',
      destination: '/:path*',
      permanent: true,
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
