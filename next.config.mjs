/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['@reduxjs/toolkit', 'react-redux'],
  },
};

export default nextConfig;
