import type { CollectionConfig } from 'payload'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tier'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'Website URL of the sponsor.',
      },
    },
    {
      name: 'tier',
      type: 'select',
      options: [
        { label: 'Main sponsor', value: 'main' },
        { label: 'Regular', value: 'regular' },
      ],
      defaultValue: 'regular',
    },
  ],
}
