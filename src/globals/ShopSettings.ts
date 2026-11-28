import type { GlobalConfig } from 'payload'

/** What every clubartikel shares: the kantine times, who gets the orders, paying and pick-up. */
export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: 'Clubartikelen: instellingen',
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    description: 'Staat op de pagina Clubartikelen (blok "Zo bestel je") en op elke productpagina.',
  },
  fields: [
    {
      name: 'kantineTimes',
      type: 'textarea',
      label: 'Openingstijden kantine',
      admin: { description: 'Eén dag per regel, bijvoorbeeld "Zaterdag 08:00 – 17:00".' },
    },
    {
      name: 'payAndPickup',
      type: 'textarea',
      label: 'Betalen en ophalen',
      admin: {
        description: 'Hoe iemand na een bestelling via het formulier betaalt en het ophaalt.',
      },
    },
    {
      name: 'orderRole',
      type: 'text',
      label: 'Bestellingen naar (functie)',
      admin: {
        description:
          'De slug van een functie bij een contactpersoon (zoals bij /contact?afdeling=...). Die krijgt de bestellingen per mail. Leeg = algemene zaken.',
      },
    },
  ],
}
