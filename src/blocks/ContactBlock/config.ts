import type { Block } from 'payload'

export const ContactBlock: Block = {
  slug: 'contactBlock',
  labels: {
    singular: 'Contactpersonen',
    plural: 'Contactpersonen',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Kopje (optioneel)',
    },
    {
      name: 'contacts',
      type: 'relationship',
      relationTo: 'contacts',
      hasMany: true,
      required: true,
      label: 'Contactpersonen',
    },
  ],
}
