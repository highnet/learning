import type { Metadata } from 'next'

import { PostCard } from '@/components/blog/post-card'
import { getBlogPosts, type BlogPost } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Stories',
  description: 'A visual archive of stories, essays, launches, and engineering dispatches.',
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-10 md:px-10">
      <section className="rounded-4xl border border-white/10 bg-zinc-950/90 p-8 text-white shadow-[0_24px_100px_-48px_rgba(0,0,0,0.95)] md:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-400">Archive</div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Stories built for big screens and quick reads.
          </h1>
          <p className="text-base leading-8 text-zinc-300 md:text-lg">
            Editorial pieces with picture-led layouts, rich metadata, and infrastructure that keeps
            the public read path fast.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {posts.map((post: BlogPost) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </section>
    </main>
  )
}
