import type { Block } from 'payload'

export const TeamDirectoryBlock: Block = {
  slug: 'teamDirectoryBlock',
  labels: {
    singular: 'Wie is wie',
    plural: 'Wie is wie',
  },
  fields: [
    {
      name: 'units',
      type: 'array',
      label: 'Functies en commissies',
      labels: { singular: 'Functie of commissie', plural: 'Functies en commissies' },
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', label: 'Functie of commissie', required: true },
        {
          name: 'people',
          type: 'array',
          label: 'Personen',
          labels: { singular: 'Persoon', plural: 'Personen' },
          admin: {
            description: 'Leeg laten als de naam uit de gekoppelde contactpersoon komt.',
          },
          fields: [
            { name: 'name', type: 'text', label: 'Naam', required: true },
            {
              name: 'note',
              type: 'text',
              label: 'Toevoeging (optioneel)',
              admin: { description: 'Bijv. "secretaris".' },
            },
          ],
        },
        {
          name: 'contact',
          type: 'relationship',
          relationTo: 'contacts',
          label: 'Contactpersoon (optioneel)',
          admin: {
            description: 'Toont telefoon en e-mail uit de contactpersoon.',
          },
        },
        {
          name: 'email',
          type: 'email',
          label: 'E-mailadres (optioneel)',
          admin: {
            description: 'Alleen voor een functieadres zonder contactpersoon.',
            condition: (_data, siblingData) => !siblingData?.contact,
          },
        },
      ],
    },
  ],
}
