import type { CollectionConfig } from 'payload'

import {
  deleteMediaProjection,
  invalidateBlogCache,
  publishBlogEvent,
  syncMediaProjection,
} from '../lib/blog-sync'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await syncMediaProjection(doc)
        await invalidateBlogCache()
        await publishBlogEvent('media.changed', {
          id: doc.id,
          filename: doc.filename,
          updatedAt: doc.updatedAt,
        })

        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        await deleteMediaProjection(doc.id)
        await invalidateBlogCache()
        await publishBlogEvent('media.deleted', {
          id: doc.id,
          filename: doc.filename,
        })

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'credit',
      type: 'text',
    },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'card',
        width: 960,
        height: 640,
        crop: 'center',
      },
      {
        name: 'hero',
        width: 1600,
        height: 900,
        crop: 'center',
      },
    ],
  },
}
