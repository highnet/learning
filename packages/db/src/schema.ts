import { integer, jsonb, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export type AppPostCategory = {
  name: string
  slug: string
}

export type AppPostGalleryItem = {
  mediaPayloadId: number
  caption?: string | null
}

export type AppPostSeo = {
  title?: string | null
  description?: string | null
  canonicalUrl?: string | null
  noIndex?: boolean | null
  ogImagePayloadId?: number | null
}

export const appPosts = pgTable('app_posts', {
  id: serial('id').primaryKey(),
  payloadPostId: integer('payload_post_id').notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: jsonb('content').$type<Record<string, unknown> | null>(),
  contentText: text('content_text'),
  status: varchar('status', { length: 32 }).notNull().default('draft'),
  featuredImagePayloadId: integer('featured_image_payload_id'),
  gallery: jsonb('gallery').$type<AppPostGalleryItem[]>().notNull().default([]),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  categories: jsonb('categories').$type<AppPostCategory[]>().notNull().default([]),
  seo: jsonb('seo').$type<AppPostSeo | null>(),
  authorPayloadId: integer('author_payload_id'),
  authorName: varchar('author_name', { length: 255 }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const appMedia = pgTable('app_media', {
  id: serial('id').primaryKey(),
  payloadMediaId: integer('payload_media_id').notNull().unique(),
  alt: text('alt'),
  caption: text('caption'),
  credit: varchar('credit', { length: 255 }),
  url: text('url'),
  thumbnailUrl: text('thumbnail_url'),
  filename: varchar('filename', { length: 255 }),
  mimeType: varchar('mime_type', { length: 255 }),
  width: integer('width'),
  height: integer('height'),
  syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type InsertAppPost = typeof appPosts.$inferInsert
export type SelectAppPost = typeof appPosts.$inferSelect
export type InsertAppMedia = typeof appMedia.$inferInsert
export type SelectAppMedia = typeof appMedia.$inferSelect
