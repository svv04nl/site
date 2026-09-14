import type { CollectionConfig } from 'payload'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  labels: {
    singular: 'Sponsor',
    plural: 'Sponsors',
  },
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
      admin: {
        description: 'Leeg laten als er nog geen logo is aangeleverd — de sponsor wordt dan overgeslagen in de ticker.',
      },
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
        { label: 'Hoofdsponsor', value: 'main' },
        { label: 'Subsponsor', value: 'sub' },
        { label: 'Hoofdsponsor jeugd', value: 'youth' },
        { label: 'Regulier', value: 'regular' },
      ],
      defaultValue: 'regular',
      admin: {
        description:
          'Bepaalt de plek op de site. main/sub/youth verschijnen in de sponsor-sidebar op de homepage; alle sponsors verschijnen in de ticker.',
      },
    },
  ],
}
