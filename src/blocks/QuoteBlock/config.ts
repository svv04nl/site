import type { Block } from 'payload'

export const QuoteBlock: Block = {
  slug: 'quoteBlock',
  labels: {
    singular: 'Quote',
    plural: "Quote's",
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      label: 'Tekst',
      required: true,
      admin: {
        description:
          'Zet woorden tussen *sterretjes* om ze uit te lichten, bijv. je *MAG* lid worden.',
      },
    },
  ],
}
