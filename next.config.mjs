/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Server Actions are stable in Next.js 14+
  },
  // Ignore TypeScript errors during build (optional, remove in production)
  typescript: {
    // Set to true if you want to ignore TS errors during build
    ignoreBuildErrors: false,
  },
  // Ignore ESLint errors during build (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
