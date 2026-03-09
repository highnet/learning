import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'learning/cms',
  description: 'Payload CMS backend app.',
}

export default function FrontendLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'Inter, Arial, sans-serif',
          margin: 0,
          background: '#0a0a0a',
          color: '#fafafa',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Payload CMS app</div>
              <h1 style={{ margin: 0, fontSize: 40 }}>Backend control plane</h1>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link href="/admin" style={{ color: '#fafafa' }}>
                Admin
              </Link>
              <Link href="/api/health" style={{ color: '#fafafa' }}>
                Health
              </Link>
            </div>
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
