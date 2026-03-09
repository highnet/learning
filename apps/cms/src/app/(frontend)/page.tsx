export default function CmsLandingPage() {
  return (
    <main style={{ display: 'grid', gap: 24 }}>
      <section
        style={{
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          padding: 32,
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>What is running here</h2>
        <p style={{ opacity: 0.8, lineHeight: 1.7 }}>
          This app hosts the Payload admin panel, REST API, GraphQL API, and any backend-only
          integrations such as Redis caching and RabbitMQ messaging.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/admin" style={{ color: '#fafafa' }}>
            Open admin
          </a>
          <a href="/api/posts" style={{ color: '#fafafa' }}>
            REST example
          </a>
          <a href="/api/graphql-playground" style={{ color: '#fafafa' }}>
            GraphQL playground
          </a>
        </div>
      </section>
    </main>
  )
}
