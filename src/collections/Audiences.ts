import type { CollectionConfig } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

/**
 * Audience landing pages ("Vind jouw weg"): one per target group (player,
 * parent, volunteer, ...). Each shows an intro plus a grid of link cards that
 * point to the relevant information pages, and an optional CTA banner.
 */
export const Audiences: CollectionConfig = {
  slug: 'audiences',
  labels: {
    singular: 'Doelgroep',
    plural: 'Doelgroepen',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'showOnHome'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && data?.name && !data.slug) {
          data.slug = (data.name as string)
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
      name: 'name',
      type: 'text',
      label: 'Naam doelgroep',
      required: true,
      admin: {
        description: 'Bijv. "Spelers". Wordt gebruikt in de titel "Alles voor <naam> van SVV\'04".',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-deel, bijv. "spelers" → /spelers',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Volgorde',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lager = eerder in de "Vind jouw weg"-sectie.',
      },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      label: 'Tonen op homepage',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'cardTitle',
      type: 'text',
      label: 'Kaarttitel (homepage)',
      required: true,
      admin: { description: 'Bijv. "Speler". Titel op de kaart in de "Vind jouw weg"-sectie.' },
    },
    {
      name: 'cardDescription',
      type: 'textarea',
      label: 'Kaartomschrijving (homepage)',
      required: true,
      admin: { description: 'Bijv. "Trainingstijden, teamindeling, programma en meer."' },
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Introtekst',
      admin: { description: 'Inleidende alinea bovenaan de doelgroeppagina.' },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Paginatekst',
      admin: {
        description:
          'Uitgebreide, unieke tekst voor deze doelgroep. Belangrijk voor SEO: hoe meer relevante, unieke inhoud, hoe beter deze pagina vindbaar is in Google.',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      label: 'SEO-titel',
      admin: {
        position: 'sidebar',
        description:
          'Titel in Google/zoekresultaten (± 60 tekens). Bijv. "Sponsor worden bij SVV\'04 Schoonebeek". Leeg = automatische titel.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'SEO-omschrijving',
      admin: {
        position: 'sidebar',
        description:
          'Omschrijving onder de titel in Google (± 155 tekens). Leeg = de introtekst of kaartomschrijving wordt gebruikt.',
      },
    },
    {
      name: 'links',
      type: 'array',
      label: 'Informatielinks',
      labels: { singular: 'Link', plural: 'Links' },
      fields: [
        { name: 'title', type: 'text', label: 'Titel', required: true },
        { name: 'description', type: 'text', label: 'Omschrijving' },
        {
          name: 'href',
          type: 'text',
          label: 'Link (URL of pad)',
          required: true,
          admin: { description: 'Bijv. /programma of https://…' },
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'CTA-balk',
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'CTA-balk tonen', defaultValue: false },
        {
          name: 'title',
          type: 'text',
          label: 'Titel',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'text',
          type: 'text',
          label: 'Tekst',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'buttonLabel',
          type: 'text',
          label: 'Knoptekst',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'buttonUrl',
          type: 'text',
          label: 'Knop-URL',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
      ],
    },
  ],
  timestamps: true,
}
