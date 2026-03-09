import Link from 'next/link'

import { serviceUrls } from '@learning/config'

import { Hero } from '@/components/marketing/hero'

const stack = [
  'Bun workspaces + Turborepo',
  'Next.js frontend with App Router',
  'shadcn/ui-ready design system',
  'Separate Payload CMS app',
  'Drizzle ORM shared package',
  'PostgreSQL, Redis, RabbitMQ via Docker',
]

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-10 md:px-10">
      <Hero />

      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-3xl border border-border/60 bg-background/70 p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">What is wired up</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The monorepo is structured to keep product UI and CMS independently deployable.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {stack.map((item) => (
              <div key={item} className="rounded-2xl border border-border/60 bg-card p-4 text-sm text-card-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Default local endpoints</h2>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li>
              Frontend:{' '}
              <Link className="text-foreground underline-offset-4 hover:underline" href={serviceUrls.web}>
                {serviceUrls.web}
              </Link>
            </li>
            <li>
              CMS:{' '}
              <Link className="text-foreground underline-offset-4 hover:underline" href={serviceUrls.cms}>
                {serviceUrls.cms}
              </Link>
            </li>
            <li>PostgreSQL: {serviceUrls.postgres}</li>
            <li>Redis: {serviceUrls.redis}</li>
            <li>RabbitMQ: {serviceUrls.rabbitmq}</li>
          </ul>
        </aside>
      </section>
    </main>
  )
}
