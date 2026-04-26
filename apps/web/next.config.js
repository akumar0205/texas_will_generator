/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  experimental: { typedRoutes: false },
};

module.exports = nextConfig;
