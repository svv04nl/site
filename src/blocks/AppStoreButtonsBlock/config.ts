import type { Block } from 'payload'

export const AppStoreButtonsBlock: Block = {
  slug: 'appStoreButtonsBlock',
  labels: {
    singular: 'App store-knoppen',
    plural: 'App store-knoppen',
  },
  fields: [
    {
      name: 'appStoreUrl',
      type: 'text',
      label: 'App Store-link (iOS)',
      required: true,
      defaultValue: 'https://apps.apple.com/nl/app/voetbal-nl-de-offici%C3%ABle-app/id418125719',
    },
    {
      name: 'playStoreUrl',
      type: 'text',
      label: 'Google Play-link (Android)',
      required: true,
      defaultValue: 'https://play.google.com/store/apps/details?id=com.xs2theworld.voetballNL&hl=nl',
    },
    {
      name: 'appStoreBadge',
      type: 'upload',
      relationTo: 'media',
      label: 'App Store-badge (afbeelding)',
      required: true,
    },
    {
      name: 'playStoreBadge',
      type: 'upload',
      relationTo: 'media',
      label: 'Google Play-badge (afbeelding)',
      required: true,
    },
  ],
}
