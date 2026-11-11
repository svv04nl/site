import type { CollectionConfig, Validate } from 'payload'
import { POST_CATEGORIES } from './post-categories'

// Hero image requirements: the hero is a wide banner (2400×1000 is the
// recommended upload), so reject images that would look soft or get cropped
// too aggressively.
const HERO_MIN_WIDTH = 2000
const HERO_MIN_RATIO = 2
const HERO_MAX_RATIO = 3

const validateHeroImage: Validate = async (value, { data, req }) => {
  if (!value || !(data as { heroFeatured?: boolean } | undefined)?.heroFeatured) {
    return true
  }

  const id = typeof value === 'object' ? (value as { id: number | string }).id : value
  const media = await req.payload.findByID({
    collection: 'media',
    id: id as number | string,
    depth: 0,
    req,
  })
  const { width, height } = media
  if (!width || !height) {
    return true
  }

  if (width < HERO_MIN_WIDTH) {
    return `Afbeelding is ${width}px breed, voor de hero is minimaal ${HERO_MIN_WIDTH}px nodig (aanbevolen: 2400×1000).`
  }
  const ratio = width / height
  if (ratio < HERO_MIN_RATIO || ratio > HERO_MAX_RATIO) {
    return `Afbeelding (${width}×${height}) heeft de verkeerde verhouding. Gebruik een brede afbeelding tussen 2:1 en 3:1 (aanbevolen: 2400×1000).`
  }
  return true
}

const HERO_MOBILE_MIN_WIDTH = 800

const validateHeroImageMobile: Validate = async (value, { data, req }) => {
  if (!value || !(data as { heroFeatured?: boolean } | undefined)?.heroFeatured) {
    return true
  }
  const id = typeof value === 'object' ? (value as { id: number | string }).id : value
  const media = await req.payload.findByID({
    collection: 'media',
    id: id as number | string,
    depth: 0,
    req,
  })
  if (media.width && media.width < HERO_MOBILE_MIN_WIDTH) {
    return `Afbeelding is ${media.width}px breed, voor de mobiele hero is minimaal ${HERO_MOBILE_MIN_WIDTH}px nodig.`
  }
  return true
}

const validateSingleFeatured: Validate = async (value, { id, siblingData, req }) => {
  if (!value) {
    return true
  }
  // A post whose window is already over no longer counts, and doesn't need to
  // be blocked by the active one either.
  const now = new Date().toISOString()
  const until = (siblingData as { heroUntil?: string } | undefined)?.heroUntil
  if (until && until < now) {
    return true
  }

  const { docs } = await req.payload.find({
    collection: 'posts',
    where: {
      and: [
        { heroFeatured: { equals: true } },
        { heroUntil: { greater_than: now } },
        ...(id ? [{ id: { not_equals: id } }] : []),
      ],
    },
    depth: 0,
    limit: 1,
    select: { title: true },
    req,
  })
  return docs[0]
    ? `Er is al een uitgelicht bericht: "${docs[0].title}". Haal daar eerst de markering weg.`
    : true
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Nieuwsbericht',
    plural: 'Nieuwsberichten',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'status', 'heroFeatured'],
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
            if (team.type === 'senior') {
              autoCategories.add('senioren')
            }
            if (team.type === 'youth') {
              autoCategories.add('junioren')
            }
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
        description: 'Afbeelding in nieuwskaarten en bovenaan het bericht (2:1 werkt het best).',
      },
    },
    {
      name: 'heroFeatured',
      type: 'checkbox',
      label: 'Uitgelicht in de hero',
      defaultValue: false,
      validate: validateSingleFeatured,
      admin: {
        position: 'sidebar',
        description:
          'Toont dit bericht als hero op de homepage, binnen de gekozen periode. Er kan er maar één tegelijk uitgelicht zijn.',
      },
    },
    {
      name: 'heroFrom',
      type: 'date',
      label: 'Hero tonen vanaf',
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data.heroFeatured),
        date: { pickerAppearance: 'dayAndTime' },
      },
      validate: (value: unknown, { siblingData }: { siblingData: { heroFeatured?: boolean } }) =>
        !siblingData?.heroFeatured || value ? true : 'Kies wanneer de hero begint.',
    },
    {
      name: 'heroUntil',
      type: 'date',
      label: 'Hero tonen tot',
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data.heroFeatured),
        date: { pickerAppearance: 'dayAndTime' },
      },
      validate: (
        value: unknown,
        { siblingData }: { siblingData: { heroFeatured?: boolean; heroFrom?: string } },
      ) => {
        if (!siblingData?.heroFeatured) {
          return true
        }
        if (!value) {
          return 'Kies wanneer de hero eindigt.'
        }
        if (siblingData.heroFrom && new Date(value as string) <= new Date(siblingData.heroFrom)) {
          return 'De einddatum moet na de startdatum liggen.'
        }
        return true
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero-afbeelding',
      validate: validateHeroImage,
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data.heroFeatured),
        description:
          'Achtergrond van de hero op de homepage. Leeg = standaard grasachtergrond. Minimaal 2000px breed, verhouding tussen 2:1 en 3:1 (aanbevolen 2400×1000). De tekst staat links, zet wat er te zien is dus rechts.',
      },
    },
    {
      name: 'heroImageMobile',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero-afbeelding mobiel (optioneel)',
      validate: validateHeroImageMobile,
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data.heroFeatured),
        description:
          'Andere afbeelding voor de hero op telefoon en tablet, als tekstachtergrond. Leeg = de hero-afbeelding wordt onder de tekst getoond (of het gras als er geen hero-afbeelding is). Minimaal 800px breed.',
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
      options: POST_CATEGORIES,
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
