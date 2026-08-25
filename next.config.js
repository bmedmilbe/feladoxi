/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'easyadapp-production.up.railway.app',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'bm-edmilbe-bucket.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
