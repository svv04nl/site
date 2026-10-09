import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Audience } from '@/payload-types'
import { FindYourWay, type FindYourWayItem } from '@/components/FindYourWay'

const MAX_LINKS = 4

// Takes the first link of every theme, then the second of every theme, and so on,
// so the panel shows a spread of the audience page instead of one theme only.
function pickLinks(themes: Audience['themes']): FindYourWayItem['links'] {
  const lists = (themes ?? []).map((t) => t.links ?? [])
  const picked: FindYourWayItem['links'] = []
  for (let i = 0; picked.length < MAX_LINKS; i++) {
    let found = false
    for (const list of lists) {
      if (list[i] && picked.length < MAX_LINKS) {
        picked.push({ title: list[i].title, description: list[i].description, href: list[i].href })
        found = true
      }
    }
    if (!found) break
  }
  return picked
}

/**
 * "Vind jouw weg bij SVV'04" on the homepage: a role picker fed by the audiences
 * (Doelgroepen) in the CMS. Chip label, intro and links come from the audience
 * itself; the CTA leads to its landing page at /[slug].
 */
export async function FindYourWaySection() {
  const payload = await getPayload({ config })

  const { docs: audiences } = await payload.find({
    collection: 'audiences',
    where: { showOnHome: { equals: true } },
    sort: 'order',
    limit: 20,
    depth: 0,
  })

  if (audiences.length === 0) return null

  const items: FindYourWayItem[] = audiences.map((a) => ({
    slug: a.slug,
    label: a.cardTitle,
    eyebrow: `Voor ${a.name}`,
    title: `Alles voor ${a.name}`,
    intro: a.cardDescription,
    cta: `Naar de pagina voor ${a.name}`,
    links: pickLinks(a.themes),
  }))

  return <FindYourWay items={items} defaultSlug="ouders" />
}
