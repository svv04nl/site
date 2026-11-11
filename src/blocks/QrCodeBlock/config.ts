import type { Block } from 'payload'

export const QrCodeBlock: Block = {
  slug: 'qrCodeBlock',
  labels: {
    singular: 'QR-code',
    plural: 'QR-codes',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'Link',
      required: true,
      admin: { description: 'De link die de QR-code opent, bijv. een WhatsApp-uitnodigingslink.' },
    },
    {
      name: 'label',
      type: 'text',
      label: 'Onderschrift (optioneel)',
      admin: { description: 'Korte tekst onder de QR-code, bijv. "Scan om lid te worden".' },
    },
  ],
}
