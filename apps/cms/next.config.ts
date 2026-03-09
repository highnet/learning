import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@learning/config', '@learning/db'],
}

export default withPayload(nextConfig, { devBundleServerPackages: true })
