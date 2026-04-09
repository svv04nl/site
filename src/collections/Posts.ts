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
      async ({ data, operation, req }) => {
        // Auto-generate slug on create
        if (operation === 'create' && data.title && !data.slug) {
          data.slug = (data.title as string)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
        }

        // Auto-set publishedAt when first published
        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        // Auto-add categories from selected team types
        if (Array.isArray(data.relatedTeams) && data.relatedTeams.length > 0) {
          const teamIds = (data.relatedTeams as Array<string | { id: string }>).map((t) =>
            typeof t === 'object' ? t.id : t,
          )
          const { docs: teams } = await req.payload.find({
            collection: 'teams',
            where: { id: { in: teamIds } },
            depth: 0,
            limit: 100,
          })

          const autoCategories = new Set<string>()
          for (const team of teams) {
            if (team.type === 'senior') autoCategories.add('senioren')
            if (team.type === 'youth') autoCategories.add('junioren')
          }

          const existing = new Set<string>(Array.isArray(data.categories) ? data.categories : [])
          autoCategories.forEach((c) => existing.add(c))
          data.categories = [...existing]
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
      name: 'imageFit',
      type: 'select',
      options: [
        { label: 'Bijsnijden (foto)', value: 'cover' },
        { label: 'Passend maken (logo/breed)', value: 'contain' },
      ],
      defaultValue: 'cover',
      admin: {
        position: 'sidebar',
        description: 'Hoe de afbeelding in de nieuwskaart wordt weergegeven.',
      },
    },
    {
      name: 'imageBackground',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Achtergrondkleur bij "passend maken".',
        condition: (data) => data.imageFit === 'contain',
        components: {
          Field: '/components/admin/ColorPickerField#ColorPickerField',
        },
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
      name: 'categories',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Club', value: 'club' },
        { label: 'Senioren', value: 'senioren' },
        { label: 'Junioren', value: 'junioren' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedTeams',
      type: 'relationship',
      relationTo: 'teams',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Koppel teams — categorie wordt automatisch ingesteld.',
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
        description: 'Korte samenvatting zichtbaar in nieuwsoverzichten.',
      },
    },
  ],
}
