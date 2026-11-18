import type { Access, CollectionConfig } from 'payload'

const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Visitors only see a pupil whose parents gave consent; editors see all of them.
const readPupils: Access = ({ req: { user } }) => (user ? true : { consent: { equals: true } })

/**
 * Pupil van de week: the youth player who walks out with the first team at a home match. The
 * homepage hero shows the pupil from four days before that match until two hours after the
 * kickoff (see components/hero/HeroSide). Only with consent of the parents.
 */
export const Pupils: CollectionConfig = {
  slug: 'pupils',
  labels: {
    singular: 'Pupil van de week',
    plural: 'Pupillen van de week',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'team', 'matchDate', 'consent'],
    description:
      'De pupil die meeloopt bij een thuiswedstrijd van het eerste. Staat vanaf 4 dagen voor die wedstrijd op de homepage, alleen met toestemming van de ouders.',
  },
  access: {
    read: readPupils,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  defaultSort: '-matchDate',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Voornaam',
      required: true,
      admin: { description: 'Alleen de voornaam, voor de privacy.' },
    },
    { name: 'team', type: 'relationship', relationTo: 'teams', label: 'Team' },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto',
      admin: { description: 'Staande foto werkt het best (4:5).' },
    },
    {
      name: 'matchDate',
      type: 'date',
      label: 'Thuiswedstrijd van het eerste',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description: 'De dag van de thuiswedstrijd waarbij deze pupil meeloopt.',
      },
    },
    {
      name: 'consent',
      type: 'checkbox',
      label: 'Ouders hebben toestemming gegeven',
      defaultValue: false,
      admin: {
        description:
          'Voor de voornaam, de foto en de antwoorden op de website. Zonder vinkje staat de pupil niet op de site.',
      },
    },
    {
      type: 'collapsible',
      label: 'Vragen (lege vragen worden niet getoond)',
      fields: [
        { name: 'position', type: 'text', label: 'Positie' },
        { name: 'favoriteClub', type: 'text', label: 'Favoriete club' },
        { name: 'favoritePlayer', type: 'text', label: 'Favoriete speler' },
        { name: 'favoriteSvvPlayer', type: 'text', label: "Favoriete speler van SVV'04 1" },
        { name: 'happyWhen', type: 'text', label: 'Hier word ik blij van' },
        { name: 'laterBecome', type: 'text', label: 'Later word ik' },
      ],
    },
  ],
  timestamps: true,
}
