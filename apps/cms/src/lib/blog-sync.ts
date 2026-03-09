import { serviceUrls } from '@learning/config'
import { appMedia, appPosts, db } from '@learning/db'
import { desc, eq } from 'drizzle-orm'

import { getRedisClient, publishEvent } from './integrations'

type MaybeRecord = Record<string, unknown> | null | undefined

type CategoryInput = {
	name?: string | null
	slug?: string | null
}

type GalleryItemInput = {
	image?: number | string | MaybeRecord
	caption?: string | null
}

type MediaDocument = {
	id: number | string
	alt?: string | null
	caption?: string | null
	credit?: string | null
	url?: string | null
	thumbnailURL?: string | null
	filename?: string | null
	mimeType?: string | null
	width?: number | null
	height?: number | null
	updatedAt?: string | Date | null
	createdAt?: string | Date | null
}

type PostDocument = {
	id: number | string
	title?: string | null
	slug?: string | null
	excerpt?: string | null
	content?: Record<string, unknown> | null
	status?: string | null
	featuredImage?: number | string | MaybeRecord
	gallery?: GalleryItemInput[] | null
	tags?: Array<{ value?: string | null } | string> | null
	categories?: CategoryInput[] | null
	seo?: {
		title?: string | null
		description?: string | null
		canonicalUrl?: string | null
		noIndex?: boolean | null
		ogImage?: number | string | MaybeRecord
	} | null
	author?: number | string | MaybeRecord
	publishedAt?: string | Date | null
	updatedAt?: string | Date | null
	createdAt?: string | Date | null
}

function asNumber(value: unknown): number | null {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value
	}

	if (typeof value === 'string') {
		const parsed = Number(value)
		return Number.isFinite(parsed) ? parsed : null
	}

	return null
}

function relationId(value: unknown): number | null {
	if (value && typeof value === 'object') {
		return asNumber((value as Record<string, unknown>).id)
	}

	return asNumber(value)
}

function relationLabel(value: unknown) {
	if (!value || typeof value !== 'object') {
		return null
	}

	const record = value as Record<string, unknown>

	return (
		(typeof record.name === 'string' && record.name) ||
		(typeof record.email === 'string' && record.email) ||
		null
	)
}

function toAbsoluteUrl(url: string | null | undefined) {
	if (!url) {
		return null
	}

	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url
	}

	return new URL(url, serviceUrls.cms).toString()
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
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

	return [directText, childrenText].filter(Boolean).join(' ').trim()
}

function normalizeTags(tags: PostDocument['tags']) {
	return (tags ?? [])
		.map((tag) => (typeof tag === 'string' ? tag : tag?.value))
		.filter((tag): tag is string => Boolean(tag?.trim()))
		.map((tag) => tag.trim())
}

function normalizeCategories(categories: PostDocument['categories']) {
	return (categories ?? [])
		.map((category) => {
			const name = category?.name?.trim()
			const slug = category?.slug?.trim() || (name ? slugify(name) : '')

			if (!name || !slug) {
				return null
			}

			return { name, slug }
		})
		.filter((category): category is { name: string; slug: string } => Boolean(category))
}

function normalizeGallery(gallery: PostDocument['gallery']) {
	return (gallery ?? [])
		.map((item) => {
			const mediaPayloadId = relationId(item?.image)

			if (!mediaPayloadId) {
				return null
			}

			return {
				mediaPayloadId,
				caption: item?.caption?.trim() || null,
			}
		})
		.filter(
			(item): item is { mediaPayloadId: number; caption: string | null } => Boolean(item),
		)
}

export async function invalidateBlogCache(slug?: string | null) {
	try {
		const redis = getRedisClient()

		if (redis.status === 'wait') {
			await redis.connect()
		}

		const keys = await redis.keys('blog:*')

		if (keys.length > 0) {
			await redis.del(...keys)
		}

		if (slug) {
			await redis.del(`blog:post:${slug}`)
		}
	} catch (error) {
		console.error('Failed to invalidate blog cache', error)
	}
}

export async function syncMediaProjection(media: MediaDocument) {
	try {
		const payloadMediaId = asNumber(media.id)

		if (!payloadMediaId) {
			return
		}

		await db
			.insert(appMedia)
			.values({
				payloadMediaId,
				alt: media.alt ?? null,
				caption: media.caption ?? null,
				credit: media.credit ?? null,
				url: toAbsoluteUrl(media.url),
				thumbnailUrl: toAbsoluteUrl(media.thumbnailURL ?? media.url),
				filename: media.filename ?? null,
				mimeType: media.mimeType ?? null,
				width: media.width ?? null,
				height: media.height ?? null,
				syncedAt: new Date(),
				createdAt: media.createdAt ? new Date(media.createdAt) : new Date(),
				updatedAt: media.updatedAt ? new Date(media.updatedAt) : new Date(),
			})
			.onConflictDoUpdate({
				target: appMedia.payloadMediaId,
				set: {
					alt: media.alt ?? null,
					caption: media.caption ?? null,
					credit: media.credit ?? null,
					url: toAbsoluteUrl(media.url),
					thumbnailUrl: toAbsoluteUrl(media.thumbnailURL ?? media.url),
					filename: media.filename ?? null,
					mimeType: media.mimeType ?? null,
					width: media.width ?? null,
					height: media.height ?? null,
					syncedAt: new Date(),
					updatedAt: media.updatedAt ? new Date(media.updatedAt) : new Date(),
				},
			})
	} catch (error) {
		console.error('Failed to sync media projection', error)
	}
}

export async function deleteMediaProjection(id: number | string) {
	try {
		const payloadMediaId = asNumber(id)

		if (!payloadMediaId) {
			return
		}

		await db.delete(appMedia).where(eq(appMedia.payloadMediaId, payloadMediaId))
	} catch (error) {
		console.error('Failed to delete media projection', error)
	}
}

export async function syncPostProjection(post: PostDocument) {
	try {
		const payloadPostId = asNumber(post.id)

		if (!payloadPostId || !post.slug) {
			return
		}

		if (post.status !== 'published') {
			await db.delete(appPosts).where(eq(appPosts.payloadPostId, payloadPostId))
			return
		}

		await db
			.insert(appPosts)
			.values({
				payloadPostId,
				title: post.title?.trim() || 'Untitled story',
				slug: post.slug,
				excerpt: post.excerpt?.trim() || null,
				content: post.content ?? null,
				contentText: extractPlainText(post.content),
				status: post.status ?? 'draft',
				featuredImagePayloadId: relationId(post.featuredImage),
				gallery: normalizeGallery(post.gallery),
				tags: normalizeTags(post.tags),
				categories: normalizeCategories(post.categories),
				seo: {
					title: post.seo?.title ?? null,
					description: post.seo?.description ?? null,
					canonicalUrl: post.seo?.canonicalUrl ?? null,
					noIndex: post.seo?.noIndex ?? null,
					ogImagePayloadId: relationId(post.seo?.ogImage),
				},
				authorPayloadId: relationId(post.author),
				authorName: relationLabel(post.author),
				publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
				syncedAt: new Date(),
				createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
				updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
			})
			.onConflictDoUpdate({
				target: appPosts.payloadPostId,
				set: {
					title: post.title?.trim() || 'Untitled story',
					slug: post.slug,
					excerpt: post.excerpt?.trim() || null,
					content: post.content ?? null,
					contentText: extractPlainText(post.content),
					status: post.status ?? 'draft',
					featuredImagePayloadId: relationId(post.featuredImage),
					gallery: normalizeGallery(post.gallery),
					tags: normalizeTags(post.tags),
					categories: normalizeCategories(post.categories),
					seo: {
						title: post.seo?.title ?? null,
						description: post.seo?.description ?? null,
						canonicalUrl: post.seo?.canonicalUrl ?? null,
						noIndex: post.seo?.noIndex ?? null,
						ogImagePayloadId: relationId(post.seo?.ogImage),
					},
					authorPayloadId: relationId(post.author),
					authorName: relationLabel(post.author),
					publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
					syncedAt: new Date(),
					updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
				},
			})
	} catch (error) {
		console.error('Failed to sync post projection', error)
	}
}

export async function deletePostProjection(id: number | string) {
	try {
		const payloadPostId = asNumber(id)

		if (!payloadPostId) {
			return
		}

		await db.delete(appPosts).where(eq(appPosts.payloadPostId, payloadPostId))
	} catch (error) {
		console.error('Failed to delete post projection', error)
	}
}

export async function publishBlogEvent(routingKey: string, payload: Record<string, unknown>) {
	try {
		await publishEvent(routingKey, payload)
	} catch (error) {
		console.error(`Failed to publish ${routingKey}`, error)
	}
}

export async function getLatestStories(limit = 3) {
	try {
		return await db.select().from(appPosts).orderBy(desc(appPosts.publishedAt)).limit(limit)
	} catch (error) {
		console.error('Failed to read latest stories from projection', error)
		return []
	}
}
