import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

// Admins manage every account; an editor only sees and edits their own.
const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }
  if (user.role === 'admin') {
    return true
  }
  return { id: { equals: user.id } }
}

// Without this an editor could make themselves admin by editing their own account.
const adminOnlyField: FieldAccess = ({ req: { user } }) => user?.role === 'admin'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Gebruiker',
    plural: 'Gebruikers',
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: adminOrSelf,
    create: isAdmin,
    update: adminOrSelf,
    delete: isAdmin,
  },
  fields: [
    // Email added by default
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
      saveToJWT: true,
      access: {
        create: adminOnlyField,
        update: adminOnlyField,
      },
    },
  ],
}
