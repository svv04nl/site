import { ACCOMMODATIE, BANKRELATIE } from '@/lib/club-info'
import { toE164 } from '@/lib/app-api/format'
import type { RoleSlug } from '@/lib/app-api/types'

export const SITE_URL = 'https://svv04.nl'

export const ROLE_SLUGS: readonly RoleSlug[] = [
  'spelers',
  'ouders',
  'trainers-leiders',
  'vrijwilligers',
  'sponsoring',
  'supporters',
]

export const isRoleSlug = (value: string): value is RoleSlug =>
  (ROLE_SLUGS as readonly string[]).includes(value)

// Same links the site uses (AppStoreButtonsBlock defaults, Header, FooterServer).
export const VOETBAL_NL = {
  iosAppStoreUrl: 'https://apps.apple.com/nl/app/voetbal-nl-de-offici%C3%ABle-app/id418125719',
  androidPlayStoreUrl:
    'https://play.google.com/store/apps/details?id=com.xs2theworld.voetballNL&hl=nl',
  androidPackage: 'com.xs2theworld.voetballNL',
} as const

export const WEBSHOP_URL = 'https://clubs.deventrade.com/nl/svv-04/clubcollectie'
export const TRIBUNE_URL = `${SITE_URL}/tribune`
export const FACEBOOK_URL = 'https://www.facebook.com/svv04'
export const INSTAGRAM_URL = 'https://www.instagram.com/svv04_schoonebeek'

export const ASSISTANT_DISCLAIMER =
  'Antwoorden komen van een AI en kunnen fouten bevatten. Controleer belangrijke zaken bij de club.'

/** Lower than this and the app asks the user to update. Raise it with the env vars when the API breaks. */
export const minAppVersion = () => ({
  ios: process.env.APP_MIN_VERSION_IOS || '1.0.0',
  android: process.env.APP_MIN_VERSION_ANDROID || '1.0.0',
})

// Fixed details from club-info.ts (also shown on the contact page), in the shape of the contract.
const [addressItem, phoneItem] = ACCOMMODATIE.items
const [bankName, bankIban] = BANKRELATIE.items[0].value.split(/:\s*/)

export const CLUB_ACCOMMODATION = {
  name: 'Sportpark De Kampen',
  address: addressItem.value,
  phone: toE164(phoneItem.value),
  mapsQuery: `Sportpark De Kampen, ${addressItem.value}`,
}

export const CLUB_BANK = { name: bankName, iban: bankIban }

// Contact roles (slug in the `roles` array of a contact) for the fixed block on the contact screen.
export const SECRETARIAT_ROLE_SLUG = 'secretaris'
export const MEMBERSHIP_ROLE_SLUG = 'ledenadministratie'
