import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    imageSizes: [
      {
        name: 'newsCard',
        width: 600,
        height: 300,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        name: 'featuredPost',
        width: 1200,
        height: 600,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 82 },
        },
      },
    ],
    adminThumbnail: 'featuredPost',
    focalPoint: true,
    resizeOptions: {
      width: 1920,
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'webp',
      options: { quality: 85 },
    },
  },
}
