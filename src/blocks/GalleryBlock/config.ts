import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'galleryBlock',
  labels: {
    singular: 'Galerij',
    plural: 'Galerijen',
  },
  fields: [
    {
      name: 'images',
      type: 'array',
      label: 'Afbeeldingen',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Afbeelding',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Bijschrift',
        },
      ],
    },
  ],
}
