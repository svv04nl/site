import type { CollectionConfig } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

const readOnly = { readOnly: true }

export const Donations: CollectionConfig = {
  slug: 'donations',
  labels: {
    singular: 'Donatie',
    plural: 'Donaties',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'fundraiser', 'companyName', 'amount', 'units', 'status', 'nameOnObject', 'createdAt'],
    description:
      'Donaties voor een fundraiser. Ze worden alleen aangemaakt via /api/donatie en bijgewerkt door de Mollie-webhook, niet rechtstreeks via de API of het adminscherm.',
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'fundraiser',
      type: 'relationship',
      relationTo: 'fundraisers',
      label: 'Fundraiser',
      required: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'name', type: 'text', label: 'Naam', required: true, admin: readOnly },
    { name: 'email', type: 'email', label: 'E-mailadres', required: true, admin: readOnly },
    { name: 'isCompany', type: 'checkbox', label: 'Bedrijf', defaultValue: false, admin: readOnly },
    { name: 'companyName', type: 'text', label: 'Bedrijfsnaam', admin: readOnly },
    {
      name: 'showOnList',
      type: 'checkbox',
      label: 'Naam op de website',
      defaultValue: false,
      admin: {
        ...readOnly,
        description:
          'Toestemming om de naam (of bedrijfsnaam), het aantal eenheden en het bedrag in de donateurslijst op de pagina van de fundraiser te tonen. Zonder vinkje blijft de donatie anoniem.',
      },
    },
    {
      name: 'nameOnObject',
      type: 'checkbox',
      label: 'Naam fysiek plaatsen',
      defaultValue: false,
      index: true,
      admin: {
        ...readOnly,
        description:
          'Toestemming om de naam (of bedrijfsnaam) fysiek te plaatsen, bijvoorbeeld op de tribune. Filter op dit vinkje en status "Betaald" voor de lijst naar de maker.',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'units', type: 'number', label: 'Aantal eenheden', required: true, admin: readOnly },
        {
          name: 'freeAmount',
          type: 'number',
          label: 'Vrije donatie (€)',
          required: true,
          admin: readOnly,
        },
        { name: 'amount', type: 'number', label: 'Donatie (€)', required: true, admin: readOnly },
        {
          name: 'fee',
          type: 'number',
          label: 'Transactiekosten (€)',
          defaultValue: 0,
          admin: {
            ...readOnly,
            description: 'Meebetaald bovenop de donatie. Telt niet mee in het opgehaalde bedrag.',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'open',
      index: true,
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Betaald', value: 'betaald' },
        { label: 'Geannuleerd', value: 'geannuleerd' },
        { label: 'Verlopen', value: 'verlopen' },
        { label: 'Mislukt', value: 'mislukt' },
      ],
      admin: { position: 'sidebar', ...readOnly },
    },
    { name: 'paidAt', type: 'date', label: 'Betaald op', admin: { position: 'sidebar', ...readOnly } },
    {
      name: 'method',
      type: 'text',
      label: 'Betaalmethode',
      admin: { position: 'sidebar', ...readOnly },
    },
    {
      name: 'mollieId',
      type: 'text',
      label: 'Mollie-betaling',
      index: true,
      admin: { position: 'sidebar', ...readOnly },
    },
    {
      name: 'publicToken',
      type: 'text',
      label: 'Terugkeertoken',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        ...readOnly,
        description: 'Staat in de terugkeer-URL van de donateur, zodat die alleen de eigen donatie ziet.',
      },
    },
  ],
  timestamps: true,
}
