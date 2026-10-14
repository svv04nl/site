import { revalidatePath } from 'next/cache'
import type { CollectionConfig } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

export const Fundraisers: CollectionConfig = {
  slug: 'fundraisers',
  labels: {
    singular: 'Fundraiser',
    plural: 'Fundraisers',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'active', 'goalAmount', 'seatPrice'],
    description:
      'Een inzamelactie met doelbedrag en prijs per stoeltje. De tribune-actie staat op svv04.nl/tribune en gebruikt de fundraiser met slug "tribune".',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', label: 'Titel', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Koppelt de fundraiser aan zijn pagina. Voor de tribune-actie moet dit "tribune" zijn.',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Actief',
      defaultValue: true,
      admin: {
        description:
          'Uitvinken sluit de actie: de pagina blijft zichtbaar, maar het formulier verdwijnt en er worden geen nieuwe donaties meer aangenomen.',
      },
    },
    {
      name: 'goalAmount',
      type: 'number',
      label: 'Doelbedrag (€)',
      min: 1,
      admin: {
        description: 'Leeg laten om geen voortgangsbalk te tonen, alleen het opgehaalde bedrag.',
      },
    },
    {
      name: 'seatPrice',
      type: 'number',
      label: 'Prijs per stoeltje (€)',
      required: true,
      defaultValue: 30,
      min: 1,
      admin: {
        step: 1,
        description:
          'Hele euro’s. Een wijziging geldt voor nieuwe donaties, al betaalde donaties blijven staan.',
      },
    },
  ],
  hooks: {
    // Prijs, doelbedrag of sluiten moet direct op de pagina zichtbaar zijn.
    afterChange: [
      ({ doc }) => {
        if (doc.slug !== 'tribune') return
        try {
          revalidatePath('/tribune')
        } catch {
          // Buiten een Next-request (bijvoorbeeld een script) is er niets te verversen.
        }
      },
    ],
  },
  timestamps: true,
}
