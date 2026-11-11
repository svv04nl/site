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
    defaultColumns: ['title', 'slug', 'active', 'goalAmount', 'unitPrice'],
    description:
      'Een inzamelactie met een optioneel doelbedrag en een optionele vaste eenheid (bijvoorbeeld een stoeltje voor een vast bedrag). De pagina op svv04.nl/tribune gebruikt de fundraiser met slug "tribune".',
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
          'Koppelt de fundraiser aan zijn pagina. Voor svv04.nl/tribune is dit "tribune".',
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
      name: 'transactionFee',
      type: 'number',
      label: 'Transactiekosten (€)',
      min: 0,
      defaultValue: 0.29,
      admin: {
        step: 0.01,
        description:
          'Optionele bijdrage die de donateur kan meebetalen, zodat het volledige bedrag naar de club gaat. Zet op 0 om de optie te verbergen. Controleer het actuele tarief bij Mollie.',
      },
    },
    {
      type: 'collapsible',
      label: 'Vaste eenheid (optioneel)',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'unitPrice',
          type: 'number',
          label: 'Prijs per eenheid (€)',
          defaultValue: 30,
          min: 1,
          admin: {
            step: 1,
            description:
              'Hele euro’s. Leeg laten voor een fundraiser zonder vaste eenheid: dan is een donatie altijd een vrij bedrag. Een wijziging geldt voor nieuwe donaties, al betaalde donaties blijven staan.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'unitName',
              type: 'text',
              label: 'Naam eenheid (enkelvoud)',
              defaultValue: 'stoeltje',
            },
            {
              name: 'unitNamePlural',
              type: 'text',
              label: 'Naam eenheid (meervoud)',
              defaultValue: 'stoeltjes',
            },
          ],
        },
      ],
    },
    {
      name: 'nameOnObjectLabel',
      type: 'text',
      label: 'Tekst bij de optie "naam plaatsen"',
      defaultValue: 'Mijn naam mag op de tribune zelf geplaatst worden.',
      admin: {
        description:
          'Zo staat de tweede toestemming in het formulier, voor een naam die fysiek wordt geplaatst. Leeg laten om de optie niet te tonen.',
      },
    },
  ],
  hooks: {
    // Prijs, doelbedrag of sluiten moet direct op de pagina zichtbaar zijn.
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath(`/${doc.slug}`)
        } catch {
          // Buiten een Next-request (bijvoorbeeld een script) is er niets te verversen.
        }
      },
    ],
  },
  timestamps: true,
}
