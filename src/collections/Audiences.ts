import type { Block, CollectionConfig } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.role === 'admin'

/**
 * Sections of an audience page below the hero, in the order the editor picks.
 * The blocks without fields only place content that is edited elsewhere on the
 * audience: the link groups ("Themablokken"), the contact person with the action
 * bar ("Aanspreekpunt" and "CTA-balk") and the assistant band.
 */
const layoutBlocks: Block[] = [
  {
    slug: 'content',
    labels: { singular: 'Contentblok', plural: 'Contentblokken' },
    fields: [
      {
        name: 'content',
        type: 'richText',
        label: 'Inhoud',
        admin: {
          description:
            "Vrije tekst met dezelfde blokken als de gewone pagina's (kaarten, pakketten, feiten, ...).",
        },
      },
    ],
  },
  {
    slug: 'themes',
    labels: { singular: 'Linkblokken (thema\'s)', plural: 'Linkblokken (thema\'s)' },
    admin: { disableBlockName: true },
    fields: [],
  },
  {
    slug: 'contact',
    labels: { singular: 'Contact en actie', plural: 'Contact en actie' },
    admin: { disableBlockName: true },
    fields: [],
  },
  {
    slug: 'assistant',
    labels: { singular: 'Stel je vraag (AI)', plural: 'Stel je vraag (AI)' },
    admin: { disableBlockName: true },
    fields: [],
  },
]

/**
 * Audience landing pages ("Voor jou"): one per target group (player, parent,
 * volunteer, ...). Each has a hero, themed link groups, a FAQ, a contact person
 * and an optional CTA banner.
 */
export const Audiences: CollectionConfig = {
  slug: 'audiences',
  labels: {
    singular: 'Doelgroep',
    plural: 'Doelgroepen',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'showOnHome'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && data?.name && !data.slug) {
          data.slug = (data.name as string)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Naam doelgroep',
      required: true,
      admin: {
        description: 'Bijv. "Spelers". Wordt gebruikt in de titel "Alles voor <naam> van SVV\'04".',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-deel, bijv. "spelers" → /spelers',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Volgorde',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lager = eerder in de "Vind jouw weg"-sectie.',
      },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      label: 'Tonen op homepage',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'cardTitle',
      type: 'text',
      label: 'Kaarttitel (homepage)',
      required: true,
      admin: { description: 'Bijv. "Speler". Titel op de kaart in de "Vind jouw weg"-sectie.' },
    },
    {
      name: 'cardDescription',
      type: 'textarea',
      label: 'Kaartomschrijving (homepage)',
      required: true,
      admin: { description: 'Bijv. "Trainingstijden, teamindeling, programma en meer."' },
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Introtekst',
      admin: { description: 'Inleidende alinea bovenaan de doelgroeppagina.' },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Paginatekst (standaardindeling)',
      admin: {
        description:
          'Alleen zichtbaar in de standaardindeling, als de indeling hierboven leeg is. Gebruik anders een Contentblok in de indeling.',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      label: 'SEO-titel',
      admin: {
        position: 'sidebar',
        description:
          'Titel in Google/zoekresultaten (± 60 tekens). Bijv. "Sponsor worden bij SVV\'04 Schoonebeek". Leeg = automatische titel.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'SEO-omschrijving',
      admin: {
        position: 'sidebar',
        description:
          'Omschrijving onder de titel in Google (± 155 tekens). Leeg = de introtekst of kaartomschrijving wordt gebruikt.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero-afbeelding',
      admin: {
        description:
          'Achtergrondfoto van de hero. Het focuspunt van de afbeelding bepaalt welk deel zichtbaar blijft. Leeg = standaard grasachtergrond.',
      },
    },
    {
      name: 'heroActions',
      type: 'array',
      label: 'Hero-knoppen',
      labels: { singular: 'Knop', plural: 'Knoppen' },
      maxRows: 3,
      admin: { description: 'Rode actieknoppen onder de introtekst in de hero (maximaal 3).' },
      fields: [
        { name: 'label', type: 'text', label: 'Knoptekst', required: true },
        {
          name: 'href',
          type: 'text',
          label: 'Link (URL of pad)',
          required: true,
          admin: { description: 'Bijv. /programma' },
        },
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Indeling onder de hero',
      labels: { singular: 'Onderdeel', plural: 'Onderdelen' },
      blocks: layoutBlocks,
      admin: {
        description:
          'Kies welke onderdelen onder de hero komen en in welke volgorde. Sleep om te verplaatsen. Leeg = standaardindeling: paginatekst, linkblokken, "Stel je vraag", contact en actie.',
      },
    },
    {
      name: 'themes',
      type: 'array',
      label: 'Themablokken',
      labels: { singular: 'Thema', plural: "Thema's" },
      admin: {
        description:
          'Gegroepeerde links, bij voorkeur drie. Ze verschijnen waar het onderdeel "Linkblokken" in de indeling staat.',
      },
      fields: [
        { name: 'title', type: 'text', label: 'Titel', required: true },
        { name: 'intro', type: 'textarea', label: 'Korte intro' },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          labels: { singular: 'Link', plural: 'Links' },
          fields: [
            { name: 'title', type: 'text', label: 'Titel', required: true },
            { name: 'description', type: 'text', label: 'Subregel' },
            {
              name: 'href',
              type: 'text',
              label: 'Link (URL of pad)',
              required: true,
              admin: { description: 'Bijv. /vereniging/lidmaatschap' },
            },
          ],
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      label: 'Veelgestelde vragen',
      labels: { singular: 'Vraag', plural: 'Vragen' },
      admin: {
        description:
          'Uitklapbare vragen met filter op categorie. Ze worden ook als FAQ-gegevens voor Google meegestuurd.',
      },
      fields: [
        {
          name: 'category',
          type: 'text',
          label: 'Categorie',
          required: true,
          admin: {
            description:
              'Bijv. "Wedstrijden". Per unieke categorie verschijnt een filterknop; de volgorde volgt de eerste vraag per categorie.',
          },
        },
        { name: 'question', type: 'text', label: 'Vraag', required: true },
        {
          name: 'answer',
          type: 'textarea',
          label: 'Antwoord',
          required: true,
          admin: { description: 'Platte tekst, geen opmaak.' },
        },
        {
          name: 'links',
          type: 'array',
          label: 'Doorklikknoppen',
          labels: { singular: 'Knop', plural: 'Knoppen' },
          fields: [
            { name: 'label', type: 'text', label: 'Knoptekst', required: true },
            {
              name: 'href',
              type: 'text',
              label: 'Link (URL of pad)',
              required: true,
              admin: { description: 'Bijv. /programma' },
            },
          ],
        },
      ],
    },
    {
      name: 'assistantIntro',
      type: 'textarea',
      label: 'Tekst onder "Stel je vraag"',
      admin: {
        description:
          'Zin onder de kop "Stel je vraag", bijv. "Over wedstrijden, kosten en meedoen: je krijgt meteen antwoord." Leeg = de standaardtekst van de homepage.',
      },
    },
    {
      name: 'faqHelp',
      type: 'group',
      label: 'Kop boven het aanspreekpunt',
      fields: [
        { name: 'title', type: 'text', label: 'Titel', admin: { description: 'Bijv. "Neem contact op". Staat boven de kaart met het aanspreekpunt.' } },
        { name: 'text', type: 'textarea', label: 'Tekst', admin: { hidden: true } },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          labels: { singular: 'Link', plural: 'Links' },
          admin: { hidden: true },
          fields: [
            { name: 'label', type: 'text', label: 'Linktekst', required: true },
            { name: 'href', type: 'text', label: 'Link (URL of pad)', required: true },
          ],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Aanspreekpunt',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Functie (optioneel)',
          admin: {
            description:
              'Leeg = de eerste functie van de contactpersoon (bijv. "Coördinator jeugd"). Alleen invullen om die te overschrijven.',
          },
        },
        {
          name: 'person',
          type: 'relationship',
          relationTo: 'contacts',
          label: 'Contactpersoon',
          admin: {
            description:
              'Naam, foto en e-mailadres komen uit de contactpersoon. Leeg = geen aanspreekpunt tonen.',
          },
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'CTA-balk',
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'CTA-balk tonen', defaultValue: false },
        {
          name: 'title',
          type: 'text',
          label: 'Titel',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'text',
          type: 'text',
          label: 'Tekst',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'buttonLabel',
          type: 'text',
          label: 'Knoptekst',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
        {
          name: 'buttonUrl',
          type: 'text',
          label: 'Knop-URL',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
      ],
    },
  ],
  timestamps: true,
}
