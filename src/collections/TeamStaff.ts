import type { CollectionConfig } from 'payload'

const authenticated = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user)

/**
 * Staff (trainers, leiders, verzorgers) per team, synced from Club.Dataservice
 * by `syncTeamStaff` (src/lib/clubdata/sync-staff.ts). Players are never stored.
 * Only readable in the admin panel; the AI assistant reads it through a narrow
 * server-side tool.
 */
export const TeamStaff: CollectionConfig = {
  slug: 'team-staff',
  labels: {
    singular: 'Staflid',
    plural: 'Staf per team',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'team', 'updatedAt'],
    description:
      'Wordt automatisch gesynchroniseerd vanuit Club.Dataservice (Sportlink). Wijzigingen hier worden bij de volgende sync overschreven.',
  },
  access: {
    read: authenticated,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'role', type: 'text', required: true },
    { name: 'team', type: 'relationship', relationTo: 'teams', required: true, index: true },
  ],
  timestamps: true,
}
