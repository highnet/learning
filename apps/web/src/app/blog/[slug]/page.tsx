/* eslint-disable @next/next/no-img-element */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RichText } from '@/components/blog/rich-text'
import { getBlogPostBySlug, getBlogPosts, type BlogGalleryImage, type BlogPost } from '@/lib/blog'

type PageProps = {
  params: Promise<{ slug: string }>
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Drafting now'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((post: BlogPost) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Story not found',
    }
  }

  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    alternates: post.seo?.canonicalUrl ? { canonical: post.seo.canonicalUrl } : undefined,
    robots: post.seo?.noIndex ? { index: false, follow: true } : undefined,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-10 md:px-10">
      <article className="overflow-hidden rounded-4xl border border-black/5 bg-white/85 shadow-[0_24px_100px_-48px_rgba(0,0,0,0.55)] backdrop-blur">
        <header className="border-b border-black/5 bg-zinc-950 px-8 py-10 text-white md:px-12 md:py-14">
          <div className="max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-zinc-400">
              <span>{formatDate(post.publishedAt)}</span>
              {post.categories.map((category: BlogPost['categories'][number]) => (
                <span key={category.slug}>{category.name}</span>
              ))}
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              {post.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">{post.excerpt}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              {post.authorName ? <span>By {post.authorName}</span> : null}
              {post.tags.map((tag: string) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {post.featuredImage?.url ? (
          <div className="border-b border-black/5 bg-zinc-950">
            <img src={post.featuredImage.url} alt={post.featuredImage.alt} className="max-h-144 w-full object-cover" />
          </div>
        ) : null}

        <div className="px-8 py-10 md:px-12 md:py-14">
          <RichText post={post} />
        </div>

        {post.gallery.length > 0 ? (
          <section className="border-t border-black/5 px-8 py-10 md:px-12 md:py-14">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Gallery</h2>
              <p className="mt-2 text-sm text-zinc-500">Supplementary frames pulled from the CMS media library.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {post.gallery.map((image: BlogGalleryImage) => (
                <figure key={`${post.slug}-${image.payloadMediaId}`} className="overflow-hidden rounded-3xl border border-black/5 bg-zinc-50">
                  {image.url ? <img src={image.url} alt={image.alt} className="aspect-4/3 w-full object-cover" /> : null}
                  <figcaption className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-zinc-500">
                    <span>{image.galleryCaption ?? image.caption ?? image.alt}</span>
                    {image.credit ? <span>{image.credit}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  )
}
