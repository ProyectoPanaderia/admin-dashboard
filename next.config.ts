/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },

  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.0.106:3000',
  ],
};

module.exports = nextConfig;