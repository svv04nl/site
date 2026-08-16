import type { Block } from 'payload'

export const PricingTableBlock: Block = {
  slug: 'pricingTableBlock',
  labels: {
    singular: 'Tarieventabel',
    plural: 'Tarieventabellen',
  },
  fields: [
    {
      name: 'rows',
      type: 'array',
      label: 'Rijen',
      labels: { singular: 'Rij', plural: 'Rijen' },
      fields: [
        { name: 'category', type: 'text', label: 'Categorie', required: true },
        { name: 'perKwartaal', type: 'text', label: 'Per kwartaal', required: true },
        { name: 'perSeizoen', type: 'text', label: 'Per seizoen' },
      ],
    },
  ],
}
