import type { Block } from 'payload'

export const AddressBlock: Block = {
  slug: 'addressBlock',
  labels: {
    singular: 'Adreskaart',
    plural: 'Adreskaarten',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Naam',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      label: 'Adres',
      required: true,
    },
    {
      name: 'plusCode',
      type: 'text',
      label: 'Plus code (optioneel)',
      admin: {
        description:
          'Google Plus Code, bijv. "MP6Q+GW Coevorden". Geeft een preciezere kaartlocatie dan het adres alleen; leeg = geocoden op basis van het adres.',
      },
    },
    {
      name: 'mapsUrl',
      type: 'text',
      label: 'Link naar Google Maps',
      admin: { description: 'Bijv. een gedeelde Google Maps-link.' },
    },
    {
      name: 'websiteUrl',
      type: 'text',
      label: 'Website (optioneel)',
    },
  ],
}
