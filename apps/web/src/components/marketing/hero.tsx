import { serviceUrls } from '@learning/config'

import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(163,230,53,0.28),_transparent_22%),radial-gradient(circle_at_80%_20%,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(135deg,_rgba(9,9,11,0.96),_rgba(24,24,27,0.88))] p-8 shadow-[0_24px_100px_-48px_rgba(0,0,0,0.95)] md:p-12">
      <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-zinc-300">
        Editorial core · Payload authoring · Redis cache · RabbitMQ events
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Build a blog that looks expensive and ships like a machine.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
              Write sharp longform stories, lead with rich visuals, project published content into
              fast read models, and keep the public experience hot with Redis and RabbitMQ.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-lime-300 text-zinc-950 hover:bg-lime-200">
              <a href="/blog">Explore stories</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <a href={serviceUrls.cms}>Open editorial CMS</a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            ['Write', 'Drafts, rich text, featured images, inline media, galleries'],
            ['Project', 'Payload stays authoritative while Drizzle powers fast reads'],
            ['Cache', 'Redis holds hot list/detail responses for the public site'],
            ['Queue', 'RabbitMQ fans out publish and media events for async work'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-400">{label}</div>
              <div className="mt-2 text-sm leading-6 text-zinc-100">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
