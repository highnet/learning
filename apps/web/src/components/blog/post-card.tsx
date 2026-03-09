/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'

import type { BlogPost } from '@/lib/blog'

function formatDate(value?: string | null) {
  if (!value) {
    return 'Drafting now'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article
      className={[
        'group overflow-hidden rounded-4xl border border-white/10 bg-zinc-950/70 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] backdrop-blur',
        featured ? 'lg:grid lg:grid-cols-[1.15fr_.85fr]' : '',
      ].join(' ')}
    >
      {post.featuredImage?.url ? (
        <div className={featured ? 'min-h-96' : 'aspect-16/10'}>
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-5 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-zinc-400">
          <span>{formatDate(post.publishedAt)}</span>
          {post.categories[0] ? <span>{post.categories[0].name}</span> : null}
        </div>

        <div className="space-y-3">
          <Link href={`/blog/${post.slug}`} className="block text-pretty text-2xl font-semibold text-white md:text-3xl">
            {post.title}
          </Link>
          <p className="text-sm leading-7 text-zinc-300 md:text-base">{post.excerpt}</p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-lime-300 transition hover:text-lime-200"
          >
            Read article
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
