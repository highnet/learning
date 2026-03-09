import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@learning/config', '@learning/db'],
}

export default nextConfig
