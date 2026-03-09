import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@learning/config', '@learning/db'],
  // Only externalize packages that are purely Node.js (no CSS imports).
  // @payloadcms/* and payload itself must NOT be here when using Turbopack —
  // they contain CSS imports that Node.js can't require() directly.
  serverExternalPackages: ['drizzle-orm', 'sharp', 'pg'],
}

// devBundleServerPackages: true — required with Turbopack so that Payload's server
// packages (which contain CSS imports like ReactCrop.css) are bundled by Turbopack
// rather than require()'d by Node.js directly, which would throw ERR_UNKNOWN_FILE_EXTENSION.
export default withPayload(nextConfig, { devBundleServerPackages: true })

