import type { Block } from 'payload'

export const BoardMembersBlock: Block = {
  slug: 'boardMembersBlock',
  labels: {
    singular: 'Bestuursleden',
    plural: 'Bestuursleden',
  },
  fields: [
    {
      name: 'members',
      type: 'array',
      label: 'Bestuursleden',
      labels: { singular: 'Bestuurslid', plural: 'Bestuursleden' },
      minRows: 1,
      fields: [
        {
          name: 'contact',
          type: 'relationship',
          relationTo: 'contacts',
          required: true,
          label: 'Contactpersoon',
          admin: {
            description:
              'Naam, foto, telefoon en e-mail komen uit deze contactpersoon. Pas die daar aan.',
          },
        },
        {
          name: 'role',
          type: 'text',
          label: 'Functie in het bestuur (optioneel)',
          admin: {
            description: 'Leeg = de eerste functie van de contactpersoon.',
          },
        },
        {
          name: 'areas',
          type: 'array',
          label: 'Verantwoordelijk voor',
          labels: { singular: 'Taakgebied', plural: 'Taakgebieden' },
          fields: [
            {
              name: 'heading',
              type: 'text',
              label: 'Kopje (optioneel)',
              admin: { description: 'Bijv. "Secretariaat". Leeg = de onderdelen staan los.' },
            },
            {
              name: 'items',
              type: 'array',
              label: 'Onderdelen',
              labels: { singular: 'Onderdeel', plural: 'Onderdelen' },
              minRows: 1,
              fields: [{ name: 'text', type: 'text', label: 'Tekst', required: true }],
            },
          ],
        },
      ],
    },
  ],
}
