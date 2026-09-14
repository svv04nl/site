import type { CollectionConfig } from 'payload'

export const Teams: CollectionConfig = {
  slug: 'teams',
  labels: {
    singular: 'Team',
    plural: 'Teams',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'category'],
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Senioren', value: 'senior' },
        { label: 'Jeugd', value: 'youth' },
        { label: 'Overig', value: 'other' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Mannen zaterdag', value: 'Mannen zaterdag' },
        { label: 'Mannen zondag', value: 'Mannen zondag' },
        { label: 'Futsal', value: 'Futsal' },
        { label: 'Vrouwen 18+', value: 'Vrouwen 18+' },
        { label: 'Mannen 18+', value: 'Mannen 18+' },
        { label: 'Mannen 35+', value: 'Mannen 35+' },
        { label: 'Mannen 45+', value: 'Mannen 45+' },
        { label: 'Onder 21', value: 'Onder 21' },
        { label: 'Onder 19', value: 'Onder 19' },
        { label: 'Onder 17', value: 'Onder 17' },
        { label: 'Onder 15', value: 'Onder 15' },
        { label: 'Onder 14', value: 'Onder 14' },
        { label: 'Onder 13', value: 'Onder 13' },
        { label: 'Onder 12', value: 'Onder 12' },
        { label: 'Onder 11', value: 'Onder 11' },
        { label: 'Onder 10', value: 'Onder 10' },
        { label: 'Onder 9', value: 'Onder 9' },
        { label: 'Onder 8', value: 'Onder 8' },
        { label: 'Onder 7', value: 'Onder 7' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Volgorde in de navigatie (lager = eerder)',
      },
    },
    {
      name: 'teamcode',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Club.Dataservice teamcode (Sportlink)',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'sponsors',
      type: 'relationship',
      relationTo: 'sponsors',
      hasMany: true,
      admin: {
        description: 'Teamsponsor(en) (Payload sponsor items) — meestal 1, soms 2 bij een gedeelde tenuedeal.',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
  ],
}
