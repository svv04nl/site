import type { Access, CollectionConfig } from 'payload'

const authenticated: Access = ({ req: { user } }) => Boolean(user)

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Clubartikelen: what the club sells itself, in the kantine or through the order form on the
 * product page. Listed by the productGridBlock on the Clubartikelen page, each with its own page at
 * /vereniging/clubartikelen/<slug>. Clubkleding is not here: that is the Stanno webshop.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Clubartikel',
    plural: 'Clubartikelen',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'inKantine', 'viaForm'],
    description:
      'Artikelen die de club zelf verkoopt. Ze staan op de pagina Clubartikelen (blok "Clubartikelen") en krijgen elk een eigen pagina met een bestelformulier.',
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  defaultSort: 'name',
  fields: [
    { name: 'name', type: 'text', label: 'Naam', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Adres',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Leeg = gemaakt uit de naam. Wordt /vereniging/clubartikelen/<adres>.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => slugify(String(value || data?.name || '')) || undefined,
        ],
      },
    },
    {
      name: 'price',
      type: 'number',
      label: 'Prijs (€)',
      min: 0,
      admin: { step: 0.01, description: 'Leeg = geen prijs tonen.' },
    },
    {
      name: 'summary',
      type: 'text',
      label: 'Korte omschrijving',
      admin: { description: 'Eén regel op de kaart, bijvoorbeeld de kleur of de maten.' },
    },
    { name: 'description', type: 'textarea', label: 'Omschrijving' },
    {
      name: 'images',
      type: 'array',
      label: "Foto's",
      labels: { singular: 'Foto', plural: "Foto's" },
      admin: {
        description: 'De eerste foto staat op de kaart. Met meer foto’s komen er miniaturen onder.',
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Foto' },
      ],
    },
    {
      name: 'sizes',
      type: 'text',
      label: 'Maten',
      admin: {
        description: 'Gescheiden door komma’s, bijvoorbeeld "S, M, L". Leeg = geen maatkeuze.',
      },
    },
    {
      name: 'inKantine',
      type: 'checkbox',
      label: 'Te koop in de kantine',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'viaForm',
      type: 'checkbox',
      label: 'Te bestellen via het formulier',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
