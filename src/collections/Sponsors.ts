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
        description:
          'Leeg laten als er nog geen logo is aangeleverd. Let op: een logo alleen is niet genoeg om in de ticker te verschijnen — dat vereist ook "Website sponsor" hieronder.',
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
      name: 'websiteSponsor',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Heeft deze sponsor de "Website sponsor" tegenprestatie? Bepaalt of het logo in de ticker en de logo-grid op /alle-sponsors verschijnt. Sponsors zonder dit vinkje (bijv. alleen tenue-sponsor) komen in de tekstlijst op /alle-sponsors, ook als ze wel een logo hebben.',
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
          'Bepaalt de plek op de site. main/sub/youth verschijnen in de sponsor-sidebar op de homepage.',
      },
    },
  ],
}
