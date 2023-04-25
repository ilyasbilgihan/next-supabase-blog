/** @type {import('next').NextConfig} */

const domain = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: [domain.split('https://')[1]],
  },
};

module.exports = nextConfig;
