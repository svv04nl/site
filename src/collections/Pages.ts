import type { CollectionConfig } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Pagina',
    plural: "Pagina's",
  },
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
      name: 'actionLabel',
      type: 'text',
      admin: {
        position: 'sidebar',
        condition: (data) => data.section === 'meedoen',
        description:
          'Korte actietekst voor de topbar en het zoekvenster, bijv. "Lid worden". Leeg = paginatitel.',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Bovenliggende pagina (optioneel)',
      admin: {
        position: 'sidebar',
        description:
          "Maakt dit een subpagina met een geneste URL, bijv. /vereniging/lidmaatschap/taken. Subpagina's verschijnen niet in het menu of de zijbalk — alleen bereikbaar via een link vanaf de bovenliggende pagina.",
      },
    },
    {
      name: 'hideFromNav',
      type: 'checkbox',
      label: 'Verbergen uit menu en zijbalk',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Verbergt deze pagina uit de Vereniging/Commissies-dropdown en de "pagina\'s"-zijbalk. De pagina blijft gewoon bereikbaar via een directe link.',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}
