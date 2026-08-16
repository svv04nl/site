import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Mediabestand',
    plural: 'Media',
  },
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
      {
        // Team listing cards (senioren/jeugd overview pages)
        name: 'teamCard',
        width: 600,
        height: undefined,
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        // Team detail page photo (main column)
        name: 'teamPhoto',
        width: 900,
        height: undefined,
        formatOptions: {
          format: 'webp',
          options: { quality: 85 },
        },
      },
    ],
    adminThumbnail: 'featuredPost',
    focalPoint: true,
    resizeOptions: {
      width: 3840,
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'webp',
      options: { quality: 85 },
    },
  },
}
