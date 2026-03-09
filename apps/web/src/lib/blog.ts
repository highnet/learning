import { serviceUrls } from '@learning/config'
import {
  appMedia,
  appPosts,
  db,
  type AppPostCategory,
  type AppPostSeo,
  type SelectAppMedia,
  type SelectAppPost,
} from '@learning/db'
import { and, desc, eq, inArray } from 'drizzle-orm'
import Redis from 'ioredis'

export type BlogMedia = {
  payloadMediaId: number
  alt: string
  caption?: string | null
  credit?: string | null
  url?: string | null
  thumbnailUrl?: string | null
  width?: number | null
  height?: number | null
}

export type BlogGalleryImage = BlogMedia & {
  galleryCaption: string | null
}

export type BlogPost = {
  id: number
  payloadPostId?: number
  title: string
  slug: string
  excerpt: string
  content?: Record<string, unknown> | null
  contentText: string
  status: string
  featuredImage?: BlogMedia | null
  gallery: BlogGalleryImage[]
  tags: string[]
  categories: AppPostCategory[]
  seo?: AppPostSeo | null
  authorName?: string | null
  publishedAt?: string | null
}

type CmsCollectionResponse<T> = {
  docs: T[]
}

type CmsMedia = {
  id: number
  alt?: string | null
  caption?: string | null
  credit?: string | null
  url?: string | null
  thumbnailUrl?: string | null
  width?: number | null
  height?: number | null
}

type CmsPost = {
  id: number
  title?: string | null
  slug?: string | null
  excerpt?: string | null
  content?: Record<string, unknown> | null
  status?: string | null
  featuredImage?: CmsMedia | number | null
  gallery?: Array<{
    image?: CmsMedia | number | null
    caption?: string | null
  }> | null
  tags?: Array<{ value?: string | null }> | null
  categories?: Array<{ name?: string | null; slug?: string | null }> | null
  seo?: AppPostSeo | null
  author?: { email?: string | null; name?: string | null } | number | null
  publishedAt?: string | null
}

const cacheTtlSeconds = 60
let redisClient: Redis | null = null

const fallbackPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The future belongs to editors with taste',
    slug: 'future-belongs-to-editors-with-taste',
    excerpt:
      'A launch story about building a sharp editorial engine with publish-ready workflows, vivid imagery, and distribution primitives baked in.',
    contentText:
      'A launch story about building a sharp editorial engine with publish-ready workflows, vivid imagery, and distribution primitives baked in.',
    status: 'published',
    featuredImage: {
      payloadMediaId: 1001,
      alt: 'Editorial desk with camera gear and a neon magazine layout',
      url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=800&q=80',
      width: 1200,
      height: 800,
      credit: 'Unsplash',
    },
    gallery: [],
    tags: ['editorial systems', 'launch'],
    categories: [{ name: 'Strategy', slug: 'strategy' }],
    seo: {
      title: 'The future belongs to editors with taste',
      description: 'A launch story for a modern editorial platform.',
      canonicalUrl: `${serviceUrls.web}/blog/future-belongs-to-editors-with-taste`,
      noIndex: false,
      ogImagePayloadId: 1001,
    },
    authorName: 'Team Learning',
    publishedAt: '2026-03-09T09:00:00.000Z',
  },
  {
    id: 2,
    title: 'Picture-led storytelling needs faster pipelines',
    slug: 'picture-led-storytelling-needs-faster-pipelines',
    excerpt:
      'Why Redis-backed reads and RabbitMQ-powered workflows matter when your newsroom is publishing visual stories all day.',
    contentText:
      'Why Redis-backed reads and RabbitMQ-powered workflows matter when your newsroom is publishing visual stories all day.',
    status: 'published',
    featuredImage: {
      payloadMediaId: 1002,
      alt: 'Fast moving blur of city lights behind a photographer',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      width: 1200,
      height: 800,
      credit: 'Unsplash',
    },
    gallery: [],
    tags: ['redis', 'rabbitmq', 'performance'],
    categories: [{ name: 'Engineering', slug: 'engineering' }],
    seo: {
      title: 'Picture-led storytelling needs faster pipelines',
      description: 'Shipping stories faster with evented infrastructure.',
      canonicalUrl: `${serviceUrls.web}/blog/picture-led-storytelling-needs-faster-pipelines`,
      noIndex: false,
      ogImagePayloadId: 1002,
    },
    authorName: 'Team Learning',
    publishedAt: '2026-03-08T12:30:00.000Z',
  },
]

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL ?? serviceUrls.redis, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    })
  }

  return redisClient
}

async function withCache<T>(key: string, fn: () => Promise<T>) {
  try {
    const redis = getRedisClient()

    if (redis.status === 'wait') {
      await redis.connect()
    }

    const cached = await redis.get(key)

    if (cached) {
      return JSON.parse(cached) as T
    }

    const value = await fn()
    await redis.set(key, JSON.stringify(value), 'EX', cacheTtlSeconds)
    return value
  } catch {
    return fn()
  }
}

function normalizeMedia(media?: Partial<BlogMedia> | CmsMedia | null): BlogMedia | null {
  if (!media?.url && !media?.thumbnailUrl) {
    return null
  }

  return {
    payloadMediaId:
      'payloadMediaId' in media && typeof media.payloadMediaId === 'number'
        ? media.payloadMediaId
        : 0,
    alt: media.alt ?? 'Editorial image',
    caption: media.caption ?? null,
    credit: media.credit ?? null,
    url: media.url ?? null,
    thumbnailUrl: media.thumbnailUrl ?? media.url ?? null,
    width: media.width ?? null,
    height: media.height ?? null,
  }
}

function extractPlainText(node: unknown): string {
  if (!node) {
    return ''
  }

  if (typeof node === 'string') {
    return node
  }

  if (Array.isArray(node)) {
    return node.map(extractPlainText).filter(Boolean).join(' ')
  }

  if (typeof node !== 'object') {
    return ''
  }

  const record = node as Record<string, unknown>
  const directText = typeof record.text === 'string' ? record.text : ''
  const childrenText = extractPlainText(record.children)

  return [directText, childrenText].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

function buildPostFromProjection(
  row: SelectAppPost,
  mediaMap: Map<number, SelectAppMedia>,
) {
  return {
    id: row.id,
    payloadPostId: row.payloadPostId,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? '',
    content: row.content,
    contentText: row.contentText ?? row.excerpt ?? '',
    status: row.status,
    featuredImage: normalizeMedia(
      row.featuredImagePayloadId ? mediaMap.get(row.featuredImagePayloadId) : null,
    ),
    gallery: (row.gallery ?? [])
      .map((item): BlogGalleryImage | null => {
        const media = mediaMap.get(item.mediaPayloadId)

        if (!media) {
          return null
        }

        const normalizedMedia = normalizeMedia(media)

        if (!normalizedMedia) {
          return null
        }

        return {
          ...normalizedMedia,
          galleryCaption: item.caption ?? null,
        }
      })
      .filter((item): item is BlogGalleryImage => Boolean(item)),
    tags: row.tags ?? [],
    categories: row.categories ?? [],
    seo: row.seo,
    authorName: row.authorName ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  } satisfies BlogPost
}

function buildPostFromCms(post: CmsPost & { slug: string }) {
  return {
    id: post.id,
    payloadPostId: post.id,
    title: post.title ?? 'Untitled story',
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    content: post.content ?? null,
    contentText: extractPlainText(post.content) || post.excerpt || '',
    status: post.status ?? 'draft',
    featuredImage:
      typeof post.featuredImage === 'object' && post.featuredImage
        ? normalizeMedia({
            payloadMediaId: post.featuredImage.id,
            alt: post.featuredImage.alt ?? 'Editorial image',
            caption: post.featuredImage.caption ?? null,
            credit: post.featuredImage.credit ?? null,
            url: post.featuredImage.url ?? null,
            thumbnailUrl: post.featuredImage.thumbnailUrl ?? post.featuredImage.url ?? null,
            width: post.featuredImage.width ?? null,
            height: post.featuredImage.height ?? null,
          })
        : null,
    gallery: (post.gallery ?? [])
      .map((item): BlogGalleryImage | null => {
        if (!item.image || typeof item.image !== 'object') {
          return null
        }

        const media = normalizeMedia({
          payloadMediaId: item.image.id,
          alt: item.image.alt ?? 'Editorial image',
          caption: item.image.caption ?? null,
          credit: item.image.credit ?? null,
          url: item.image.url ?? null,
          thumbnailUrl: item.image.thumbnailUrl ?? item.image.url ?? null,
          width: item.image.width ?? null,
          height: item.image.height ?? null,
        })

        if (!media) {
          return null
        }

        return {
          ...media,
          galleryCaption: item.caption ?? null,
        }
      })
      .filter((item): item is BlogGalleryImage => Boolean(item)),
    tags: (post.tags ?? []).map((tag) => tag.value).filter((tag): tag is string => Boolean(tag)),
    categories: (post.categories ?? [])
      .map((category) => {
        const name = category.name?.trim()
        const categorySlug = category.slug?.trim()

        if (!name || !categorySlug) {
          return null
        }

        return { name, slug: categorySlug }
      })
      .filter((category): category is AppPostCategory => Boolean(category)),
    seo: post.seo ?? null,
    authorName:
      post.author && typeof post.author === 'object'
        ? post.author.name ?? post.author.email ?? null
        : null,
    publishedAt: post.publishedAt ?? null,
  } satisfies BlogPost
}

async function getMediaMap(rows: SelectAppPost[]) {
  const mediaIds = Array.from(
    new Set(
      rows.flatMap((row: SelectAppPost) => [
        row.featuredImagePayloadId,
        row.seo?.ogImagePayloadId ?? null,
        ...(row.gallery ?? []).map((item: { mediaPayloadId: number }) => item.mediaPayloadId),
      ]),
    ),
  ).filter((id): id is number => typeof id === 'number')

  const mediaRows = mediaIds.length
    ? await db.select().from(appMedia).where(inArray(appMedia.payloadMediaId, mediaIds))
    : []

  return new Map<number, SelectAppMedia>(
    mediaRows.map((item: SelectAppMedia) => [item.payloadMediaId, item]),
  )
}

async function fetchPostsFromProjection() {
  const rows = await db
    .select()
    .from(appPosts)
    .where(eq(appPosts.status, 'published'))
    .orderBy(desc(appPosts.publishedAt), desc(appPosts.updatedAt))
    .limit(12)

  const mediaMap = await getMediaMap(rows)

  return rows.map((row: SelectAppPost) => buildPostFromProjection(row, mediaMap))
}

async function fetchPostsFromCms() {
  const response = await fetch(
    `${serviceUrls.cms}/api/posts?where[status][equals]=published&limit=12&depth=2&sort=-publishedAt`,
    {
      next: {
        revalidate: cacheTtlSeconds,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch posts from CMS: ${response.status}`)
  }

  const data = (await response.json()) as CmsCollectionResponse<CmsPost>

  return data.docs
    .filter((post): post is CmsPost & { slug: string } => Boolean(post.slug))
    .map((post) => buildPostFromCms(post))
}

async function fetchPostFromCms(slug: string) {
  const response = await fetch(
    `${serviceUrls.cms}/api/posts?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&limit=1&depth=2`,
    {
      next: {
        revalidate: cacheTtlSeconds,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch ${slug} from CMS: ${response.status}`)
  }

  const data = (await response.json()) as CmsCollectionResponse<CmsPost>
  const [post] = data.docs

  if (!post?.slug) {
    return null
  }

  return buildPostFromCms(post as CmsPost & { slug: string })
}

export async function getBlogPosts() {
  return withCache('blog:posts', async () => {
    try {
      const projectedPosts = await fetchPostsFromProjection()

      if (projectedPosts.length > 0) {
        return projectedPosts
      }
    } catch {
      // fall back to the CMS API below
    }

    try {
      return await fetchPostsFromCms()
    } catch {
      return fallbackPosts
    }
  })
}

export async function getFeaturedPosts() {
  const posts = await getBlogPosts()
  return posts.slice(0, 3)
}

export async function getBlogPostBySlug(slug: string) {
  return withCache(`blog:post:${slug}`, async () => {
    try {
      const [row] = await db
        .select()
        .from(appPosts)
        .where(and(eq(appPosts.slug, slug), eq(appPosts.status, 'published')))
        .limit(1)

      if (row) {
        const mediaMap = await getMediaMap([row])
        return buildPostFromProjection(row, mediaMap)
      }
    } catch {
      // fall back to the CMS API below
    }

    try {
      return await fetchPostFromCms(slug)
    } catch {
      // ignore and fall back below
    }

    return fallbackPosts.find((post) => post.slug === slug) ?? null
  })
}
