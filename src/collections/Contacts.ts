import type { CollectionConfig } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'group', 'showInContactForm'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Naam',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      label: 'Functie',
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-mailadres',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefoon (06-nummer)',
    },
    {
      name: 'group',
      type: 'text',
      label: 'Groep',
      admin: {
        position: 'sidebar',
        description:
          'Kopje waaronder dit contact op de contactpagina valt, bijv. "Secretariaat".',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Volgorde',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lager = hoger in de lijst.',
      },
    },
    {
      name: 'showInContactForm',
      type: 'checkbox',
      label: 'Tonen in contactformulier',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Alleen aangevinkte contacten verschijnen als optie in het contactformulier.',
      },
    },
  ],
  timestamps: true,
}
