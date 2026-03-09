import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const appPosts = pgTable('app_posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type InsertAppPost = typeof appPosts.$inferInsert
export type SelectAppPost = typeof appPosts.$inferSelect
