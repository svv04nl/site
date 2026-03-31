import type { CollectionConfig } from 'payload'

export const Teams: CollectionConfig = {
  slug: 'teams',
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
        { label: 'Mannen zaterdag', value: 'mannen-zaterdag' },
        { label: 'Mannen zondag', value: 'mannen-zondag' },
        { label: 'Mannen futsal', value: 'mannen-futsal' },
        { label: 'Vrouwen 18+', value: 'vrouwen-18' },
        { label: 'Mannen 35+', value: 'mannen-35' },
        { label: 'Mannen 45+', value: 'mannen-45' },
        { label: 'JO21', value: 'jo21' },
        { label: 'JO19', value: 'jo19' },
        { label: 'JO17', value: 'jo17' },
        { label: 'JO15', value: 'jo15' },
        { label: 'JO13', value: 'jo13' },
        { label: 'JO12', value: 'jo12' },
        { label: 'JO11', value: 'jo11' },
        { label: 'JO10', value: 'jo10' },
        { label: 'JO9', value: 'jo9' },
        { label: 'JO8', value: 'jo8' },
        { label: 'JO7', value: 'jo7' },
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
      name: 'description',
      type: 'richText',
    },
  ],
}
