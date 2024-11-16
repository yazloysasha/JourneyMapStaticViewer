/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  publicRuntimeConfig: {
    TITLE: process.env.TITLE,
  },
  staticPageGenerationTimeout: 60 * 60 * 24 * 30,
};

export default nextConfig;
