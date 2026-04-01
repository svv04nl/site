import type { CollectionConfig } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'slug'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'section',
      type: 'select',
      required: true,
      defaultValue: 'vereniging',
      options: [
        { label: 'Vereniging', value: 'vereniging' },
        { label: 'Commissies', value: 'commissies' },
        { label: 'Meedoen', value: 'meedoen' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'URL slug, e.g. "technische-commissie" → /commissies/technische-commissie',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}
