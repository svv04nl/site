import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'status'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && data.title && !data.slug) {
          data.slug = (data.title as string)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
        }
        return data
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Nieuws', value: 'nieuws' },
        { label: 'Overig', value: 'overig' },
      ],
      defaultValue: 'nieuws',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown in news overviews.',
      },
    },
  ],
}
