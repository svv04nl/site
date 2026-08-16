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
        { label: 'Mannen 35+', value: 'Mannen 35+' },
        { label: 'Mannen 45+', value: 'Mannen 45+' },
        { label: 'Jeugd onder 21', value: 'Jeugd onder 21' },
        { label: 'Jeugd onder 19', value: 'Jeugd onder 19' },
        { label: 'Jeugd onder 17', value: 'Jeugd onder 17' },
        { label: 'Jeugd onder 15', value: 'Jeugd onder 15' },
        { label: 'Jeugd onder 13', value: 'Jeugd onder 13' },
        { label: 'Jeugd onder 12', value: 'Jeugd onder 12' },
        { label: 'Jeugd onder 11', value: 'Jeugd onder 11' },
        { label: 'Jeugd onder 10', value: 'Jeugd onder 10' },
        { label: 'Jeugd onder 9', value: 'Jeugd onder 9' },
        { label: 'Jeugd onder 8', value: 'Jeugd onder 8' },
        { label: 'Jeugd onder 7', value: 'Jeugd onder 7' },
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
      name: 'sponsor',
      type: 'relationship',
      relationTo: 'sponsors',
      admin: {
        description: 'Teamsponsor (Payload sponsor item)',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
  ],
}
