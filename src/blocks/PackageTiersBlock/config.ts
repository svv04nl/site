import type { Block } from 'payload'

export const PackageTiersBlock: Block = {
  slug: 'packageTiersBlock',
  labels: {
    singular: 'Pakketten',
    plural: 'Pakketten',
  },
  fields: [
    {
      name: 'tiers',
      type: 'array',
      label: 'Pakketten',
      labels: { singular: 'Pakket', plural: 'Pakketten' },
      minRows: 1,
      fields: [
        { name: 'name', type: 'text', label: 'Naam', required: true },
        {
          name: 'level',
          type: 'select',
          label: 'Kleur',
          required: true,
          defaultValue: 'basis',
          options: [
            { label: 'Basis (donkergrijs)', value: 'basis' },
            { label: 'Brons', value: 'brons' },
            { label: 'Zilver', value: 'zilver' },
            { label: 'Goud', value: 'goud' },
          ],
        },
        {
          name: 'duration',
          type: 'text',
          label: 'Contractduur',
          admin: { description: 'Bijv. "Minimaal 3 jaar".' },
        },
        {
          name: 'items',
          type: 'array',
          label: 'Onderdelen',
          labels: { singular: 'Onderdeel', plural: 'Onderdelen' },
          fields: [{ name: 'text', type: 'text', label: 'Tekst', required: true }],
        },
      ],
    },
  ],
}
