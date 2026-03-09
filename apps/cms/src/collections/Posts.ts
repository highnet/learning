import type { CollectionConfig } from 'payload'

import {
  deletePostProjection,
  invalidateBlogCache,
  publishBlogEvent,
  syncPostProjection,
} from '../lib/blog-sync'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) => `http://localhost:4000/blog/${data?.slug ?? ''}`,
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
    },
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) {
          return data
        }

        if (typeof data.title === 'string' && (!data.slug || typeof data.slug !== 'string')) {
          data.slug = slugify(data.title)
        }

        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc }) => {
        await syncPostProjection(doc)
        await invalidateBlogCache(typeof doc.slug === 'string' ? doc.slug : null)
        await publishBlogEvent('post.changed', {
          id: doc.id,
          slug: doc.slug,
          status: doc.status,
          publishedAt: doc.publishedAt,
          updatedAt: doc.updatedAt,
        })

        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        await deletePostProjection(doc.id)
        await invalidateBlogCache(typeof doc.slug === 'string' ? doc.slug : null)
        await publishBlogEvent('post.deleted', {
          id: doc.id,
          slug: doc.slug,
        })

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            width: '60%',
            description: 'Used for the public URL in the web app.',
          },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'draft',
          options: [
            {
              label: 'Draft',
              value: 'draft',
            },
            {
              label: 'Published',
              value: 'published',
            },
          ],
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'publishedAt',
          type: 'date',
          admin: {
            width: '50%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 280,
      admin: {
        description: 'Short dek used in cards and SEO descriptions.',
      },
    },
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tags',
          type: 'array',
          admin: {
            width: '50%',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'categories',
          type: 'array',
          admin: {
            width: '50%',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'canonicalUrl',
          type: 'text',
        },
        {
          name: 'ogImage',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
