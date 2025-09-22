/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },
  experimental: {
    esmExternals: 'loose'
  },
  transpilePackages: ['@floating-ui/react-dom', '@floating-ui/dom', '@floating-ui/core', '@floating-ui/utils'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@floating-ui/react-dom': require.resolve('@floating-ui/react-dom'),
      '@floating-ui/dom': require.resolve('@floating-ui/dom'),
      '@floating-ui/core': require.resolve('@floating-ui/core'),
      '@floating-ui/utils': require.resolve('@floating-ui/utils'),
    }
    return config
  },
}

module.exports = nextConfig
