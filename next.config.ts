/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // to pomija błędy ESLint przy buildzie
  },
};

module.exports = nextConfig;
