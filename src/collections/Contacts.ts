import type { CollectionConfig } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  labels: {
    singular: 'Contactpersoon',
    plural: 'Contactpersonen',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'roles', 'group', 'showInContactForm'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (Array.isArray(data?.roles)) {
          for (const role of data.roles) {
            if (role && !role.slug && role.title) {
              role.slug = slugify(role.title)
            }
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Naam',
      required: true,
    },
    {
      name: 'roles',
      type: 'array',
      label: 'Functies',
      labels: { singular: 'Functie', plural: "Functie's" },
      admin: {
        description:
          'Een persoon kan meerdere functies hebben. Linken (bijv. vanuit een ContactBlock of het contactformulier) gebeurt via de slug van de functie, niet via de persoon.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Functie',
          required: true,
        },
        {
          name: 'topic',
          type: 'text',
          label: 'Contactonderwerp (optioneel)',
          admin: {
            description:
              'Waar een bezoeker op zoekt, bijv. "Algemeen". Verschijnt in het contactformulier als "Onderwerp (Functie)", bijv. "Algemeen (Secretaris)". Leeg = toont alleen de functienaam.',
          },
        },
        {
          name: 'slug',
          type: 'text',
          label: 'Slug (voor linken)',
          admin: {
            description:
              'URL-vriendelijke code voor deep links naar het contactformulier, bijv. "ledenadministratie". Leeg = automatisch afgeleid van de functie.',
          },
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-mailadres',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefoon (06-nummer)',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto',
      admin: {
        description: 'Optioneel. Wordt getoond als aanspreekpunt op de doelgroeppagina\'s.',
      },
    },
    {
      name: 'group',
      type: 'text',
      label: 'Groep',
      admin: {
        position: 'sidebar',
        description:
          'Kopje waaronder dit contact op de contactpagina valt, bijv. "Secretariaat".',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Volgorde',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lager = hoger in de lijst.',
      },
    },
    {
      name: 'showInContactForm',
      type: 'checkbox',
      label: 'Tonen in contactformulier',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Alleen aangevinkte contacten verschijnen als optie in het contactformulier.',
      },
    },
    {
      name: 'showOnContactPage',
      type: 'checkbox',
      label: 'Tonen in kolom op contactpagina',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description:
          'Zet uit om dit contact te verbergen in de rechterkolom van de contactpagina (bijv. contacten die alleen via een ContactBlock op een specifieke pagina getoond worden).',
      },
    },
  ],
  timestamps: true,
}
