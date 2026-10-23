import type { Block } from 'payload'

export const OptionCardsBlock: Block = {
  slug: 'optionCardsBlock',
  labels: {
    singular: 'Kaarten met opties',
    plural: 'Kaarten met opties',
  },
  fields: [
    {
      name: 'cards',
      type: 'array',
      label: 'Kaarten',
      labels: { singular: 'Kaart', plural: 'Kaarten' },
      minRows: 1,
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Icoon',
          defaultValue: 'board',
          options: [
            { label: 'Reclamebord', value: 'board' },
            { label: 'Website', value: 'globe' },
            { label: 'Boek', value: 'book' },
            { label: 'Programmaboekje', value: 'newspaper' },
            { label: 'Beeldscherm', value: 'monitor' },
            { label: 'Voetbal', value: 'ball' },
            { label: 'Vlag', value: 'flag' },
            { label: 'Stoel', value: 'seat' },
            { label: 'Shirt', value: 'shirt' },
            { label: 'Trofee', value: 'trophy' },
          ],
        },
        { name: 'title', type: 'text', label: 'Titel', required: true },
        { name: 'description', type: 'textarea', label: 'Omschrijving', required: true },
        {
          name: 'details',
          type: 'array',
          label: 'Kenmerken (optioneel)',
          labels: { singular: 'Kenmerk', plural: 'Kenmerken' },
          admin: { description: 'Korte labels onder de tekst, bijv. een formaat of looptijd.' },
          fields: [{ name: 'text', type: 'text', label: 'Tekst', required: true }],
        },
        {
          name: 'badge',
          type: 'text',
          label: 'Label rechtsboven (optioneel)',
          admin: { description: 'Bijv. "Op maat" of "In voorbereiding".' },
        },
      ],
    },
  ],
}
