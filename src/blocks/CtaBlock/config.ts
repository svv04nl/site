import type { Block } from 'payload'

export const CtaBlock: Block = {
  slug: 'ctaBlock',
  labels: {
    singular: 'Call to Action',
    plural: 'Call to Actions',
  },
  fields: [
    {
      name: 'buttonLabel',
      type: 'text',
      label: 'Knoptekst',
      required: true,
    },
    {
      name: 'buttonUrl',
      type: 'text',
      label: 'URL',
      required: true,
    },
  ],
}
