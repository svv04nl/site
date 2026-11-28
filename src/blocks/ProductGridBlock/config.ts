import type { Block } from 'payload'

export const ProductGridBlock: Block = {
  slug: 'productGridBlock',
  labels: {
    singular: 'Clubartikelen',
    plural: 'Clubartikelen',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      defaultValue: 'Te koop bij de club',
    },
    {
      name: 'showHowToOrder',
      type: 'checkbox',
      label: 'Blok "Zo bestel je" eronder',
      defaultValue: true,
      admin: {
        description:
          'Met de openingstijden van de kantine en "betalen en ophalen" uit Clubartikelen: instellingen.',
      },
    },
  ],
}
