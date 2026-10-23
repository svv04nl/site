import type { Block } from 'payload'

export const FactsBlock: Block = {
  slug: 'factsBlock',
  labels: {
    singular: 'Kerncijfers',
    plural: 'Kerncijfers',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Cijfers',
      labels: { singular: 'Cijfer', plural: 'Cijfers' },
      minRows: 2,
      maxRows: 4,
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Cijfer of woord',
          required: true,
          admin: { description: 'Kort houden, bijv. "2004" of "500+".' },
        },
        { name: 'label', type: 'text', label: 'Omschrijving', required: true },
      ],
    },
  ],
}
