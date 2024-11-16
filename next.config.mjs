/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  publicRuntimeConfig: {
    TITLE: process.env.TITLE,
  },
  staticPageGenerationTimeout: 2147483647,
};

export default nextConfig;
