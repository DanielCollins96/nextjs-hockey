/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.nhle.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // No Sentry integration for Cloudflare builds
  experimental: {
    instrumentationHook: false,
  },
}

module.exports = nextConfig;
