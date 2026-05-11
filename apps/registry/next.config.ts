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
    {
      source: '/patterns',
      destination: '/browse/patterns',
      permanent: true,
    },
    {
      source: '/themes',
      destination: '/browse/themes',
      permanent: true,
    },
    {
      source: '/blueprints',
      destination: '/browse/blueprints',
      permanent: true,
    },
    {
      source: '/archetypes',
      destination: '/browse/archetypes',
      permanent: true,
    },
    {
      source: '/shells',
      destination: '/browse/shells',
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
