import Link from 'next/link'

import { serviceUrls } from '@learning/config'

import { PostCard } from '@/components/blog/post-card'
import { Hero } from '@/components/marketing/hero'
import { getBlogPosts, getFeaturedPosts, type BlogPost } from '@/lib/blog'

const stats = [
  ['Write', 'Draft and publish visual articles with editorial metadata'],
  ['Read', 'Serve fast blog pages from Drizzle projections and Redis cache'],
  ['React', 'Emit RabbitMQ events on publish, edits, and media changes'],
]

export default async function HomePage() {
  const [featuredPosts, posts] = await Promise.all([getFeaturedPosts(), getBlogPosts()])
  const leadPost = featuredPosts[0] ?? posts[0]
  const secondaryPosts = featuredPosts.slice(1)
  const latestPosts = posts.slice(0, 6)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-12 px-6 py-10 md:px-10">
      <Hero />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-4xl border border-white/10 bg-zinc-950/80 p-8 text-white shadow-[0_24px_100px_-48px_rgba(0,0,0,0.95)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">The machine behind the magazine</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                The CMS owns the editorial workflow. Published stories sync into a projection
                model, RabbitMQ handles event fanout, and Redis keeps public reads quick.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map(([label, copy]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-[0.28em] text-zinc-400">{label}</div>
                <div className="mt-3 text-sm leading-6 text-zinc-100">{copy}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-4xl border border-black/5 bg-white/70 p-8 shadow-sm backdrop-blur">
          <h2 className="text-xl font-semibold text-zinc-950">Default local endpoints</h2>
          <ul className="mt-5 space-y-3 text-sm text-zinc-600">
            <li>
              Frontend:{' '}
              <Link className="text-zinc-950 underline-offset-4 hover:underline" href={serviceUrls.web}>
                {serviceUrls.web}
              </Link>
            </li>
            <li>
              CMS:{' '}
              <Link className="text-zinc-950 underline-offset-4 hover:underline" href={serviceUrls.cms}>
                {serviceUrls.cms}
              </Link>
            </li>
            <li>PostgreSQL: {serviceUrls.postgres}</li>
            <li>Redis: {serviceUrls.redis}</li>
            <li>RabbitMQ: {serviceUrls.rabbitmq}</li>
          </ul>
        </aside>
      </section>

      {leadPost ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">Lead story</h2>
              <p className="mt-2 text-sm text-zinc-600">
                The newest visual story sits front and center with supporting editorial picks.
              </p>
            </div>
            <Link href="/blog" className="text-sm font-medium text-zinc-950 underline decoration-lime-400 underline-offset-4">
              Visit the full archive
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <PostCard post={leadPost} featured />

            <div className="grid gap-6">
              {secondaryPosts.map((post: BlogPost) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">Latest dispatches</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Fresh stories pulled from the projection layer, with CMS fallback while the sync is warming up.
            </p>
          </div>
          <Link href="/blog" className="text-sm font-medium text-zinc-950 underline decoration-lime-400 underline-offset-4">
            Browse all stories
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {latestPosts.map((post: BlogPost) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  )
}
