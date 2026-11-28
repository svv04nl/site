import type { Block } from 'payload'

/** A photo next to a short text and one button. Used for the Stanno webshop on Clubartikelen. */
export const FeatureCardBlock: Block = {
  slug: 'featureCardBlock',
  labels: {
    singular: 'Uitgelicht blok',
    plural: 'Uitgelichte blokken',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Bovenregel',
      admin: { description: 'Bijvoorbeeld "Clubkleding".' },
    },
    { name: 'title', type: 'text', label: 'Titel', required: true },
    { name: 'text', type: 'textarea', label: 'Tekst' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Foto' },
    { name: 'buttonLabel', type: 'text', label: 'Tekst op de knop' },
    {
      name: 'url',
      type: 'text',
      label: 'Link van de knop',
      admin: { description: 'Een adres buiten de site opent in een nieuw tabblad.' },
    },
  ],
}
