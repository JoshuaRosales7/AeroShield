/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      {
        protocol: "https",
        hostname: "blob.v0.app",
      },
    ],
    unoptimized: true,
  },

  experimental: {
    appDir: true, // 👈 NECESARIO para que funcione /app/api/*
    allowedDevOverlayNonReactAttributes: true,
  },
}

export default nextConfig
