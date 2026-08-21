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
    ],
  },
};

module.exports = nextConfig;
