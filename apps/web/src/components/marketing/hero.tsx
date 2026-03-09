import { serviceUrls } from '@learning/config'

import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur md:p-12">
      <div className="mb-4 inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
        Bun monorepo · Next.js · shadcn/ui · Payload · Drizzle · Postgres · Redis · RabbitMQ
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              Ship the frontend on Vercel and keep the backend ready for a container host.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              This starter gives you a modern App Router storefront, a separate Payload CMS app,
              a shared Drizzle package for PostgreSQL, and local infrastructure via Docker.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={serviceUrls.cms}>Open CMS</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/api/health">Check frontend health</a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            ['Frontend', 'Next.js 16.1.6 + shadcn/ui on Vercel'],
            ['Backend', 'Payload 3.79.0 + Next.js 15.4.11'],
            ['Data', 'Drizzle ORM 0.45.1 + PostgreSQL'],
            ['Infra', 'Redis and RabbitMQ via Docker'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="text-sm font-medium text-foreground">{label}</div>
              <div className="mt-1 text-sm text-muted-foreground">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
