import type { Block } from 'payload'

// Kinds of document. The first group is about the game itself, the second is per role.
export const DOCUMENT_KINDS = [
  { label: 'Wedstrijdvorm', value: 'gameFormat', group: 'game' },
  { label: 'Spelregels', value: 'rules', group: 'game' },
  { label: 'Protocol', value: 'protocol', group: 'game' },
  { label: 'Meer informatie', value: 'info', group: 'game' },
  { label: 'Speler', value: 'player', group: 'role' },
  { label: 'Ouder of verzorger', value: 'parent', group: 'role' },
  { label: 'Trainer en coach', value: 'coach', group: 'role' },
  { label: 'Begeleider', value: 'supervisor', group: 'role' },
  { label: 'Spelbegeleider', value: 'referee', group: 'role' },
] as const

export type DocumentKind = (typeof DOCUMENT_KINDS)[number]['value']

export const DocumentCardsBlock: Block = {
  slug: 'documentCardsBlock',
  labels: {
    singular: 'Documentkaarten',
    plural: 'Documentkaarten',
  },
  fields: [
    {
      name: 'cards',
      type: 'array',
      label: 'Kaarten',
      labels: { singular: 'Kaart', plural: 'Kaarten' },
      minRows: 1,
      admin: { description: 'Eén kaart per categorie, bijv. per leeftijd. Ze staan twee aan twee naast elkaar.' },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Titel',
          required: true,
          admin: { description: 'Bijv. "Onder 8 tot en met 10".' },
        },
        {
          name: 'format',
          type: 'text',
          label: 'Label (optioneel)',
          admin: { description: 'Bijv. "6 tegen 6".' },
        },
        { name: 'intro', type: 'textarea', label: 'Korte intro (optioneel)' },
        {
          name: 'wide',
          type: 'checkbox',
          label: 'Volle breedte',
          defaultValue: false,
          admin: { description: 'Voor een kaart met veel documenten.' },
        },
        {
          name: 'rows',
          type: 'array',
          label: 'Documenten',
          labels: { singular: 'Document', plural: 'Documenten' },
          minRows: 1,
          admin: {
            description: 'Documenten over de wedstrijd staan bovenaan, die per rol eronder.',
          },
          fields: [
            { name: 'title', type: 'text', label: 'Titel', required: true },
            {
              name: 'kind',
              type: 'select',
              label: 'Soort',
              required: true,
              defaultValue: 'gameFormat',
              options: DOCUMENT_KINDS.map(({ label, value }) => ({ label, value })),
            },
            { name: 'url', type: 'text', label: 'Link', required: true },
            {
              name: 'fileType',
              type: 'select',
              label: 'Type',
              defaultValue: 'pdf',
              options: [
                { label: 'PDF', value: 'pdf' },
                { label: 'Webpagina', value: 'page' },
              ],
            },
            {
              name: 'size',
              type: 'text',
              label: 'Grootte (optioneel)',
              admin: { description: 'Alleen bij grote bestanden, bijv. "13 MB".' },
            },
          ],
        },
      ],
    },
  ],
}
