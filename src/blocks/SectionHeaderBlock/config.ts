import type { Block } from 'payload'

export const SectionHeaderBlock: Block = {
  slug: 'sectionHeaderBlock',
  labels: {
    singular: 'Sectiekop',
    plural: 'Sectiekoppen',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Klein label boven de titel (optioneel)',
      admin: { description: 'Bijv. "De club" of "Sponsoren".' },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
      admin: {
        description:
          'Zet woorden tussen *sterretjes* om ze in de clubkleur te tonen, bijv. "Sponsor*mogelijkheden*".',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Korte intro (optioneel)',
    },
  ],
}
