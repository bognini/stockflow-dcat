import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dcat.ci',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // Kept for any other potential experimental features, but allowedDevOrigins is moved.
  },
  // Add allowedDevOrigins at the root level of the config
  allowedDevOrigins: [
      'https://*.cloudworkstations.dev',
      'https://*.firebase.studio',
  ],
};

export default nextConfig;
