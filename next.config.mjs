/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  publicRuntimeConfig: {
    TITLE: process.env.TITLE,
  },
  staticPageGenerationTimeout: 1000 * 60 * 60 * 24 * 7,
};

export default nextConfig;
