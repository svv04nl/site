import type { Block } from 'payload'

export const AdFormatsBlock: Block = {
  slug: 'adFormatsBlock',
  labels: {
    singular: 'Advertentieformaten',
    plural: 'Advertentieformaten',
  },
  fields: [
    { name: 'heading', type: 'text', label: 'Kopje', required: true },
    { name: 'description', type: 'text', label: 'Omschrijving (optioneel)' },
    {
      name: 'formats',
      type: 'array',
      label: 'Formaten',
      labels: { singular: 'Formaat', plural: 'Formaten' },
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Naam',
          required: true,
          admin: { description: 'Bijv. "1/2 pagina".' },
        },
        { name: 'width', type: 'number', label: 'Breedte (mm)', required: true, min: 1 },
        { name: 'height', type: 'number', label: 'Hoogte (mm)', required: true, min: 1 },
        {
          name: 'note',
          type: 'text',
          label: 'Toelichting (optioneel)',
          admin: { description: 'Bijv. "staand".' },
        },
      ],
    },
  ],
}
