import { getPayload } from 'payload'
import config from '@payload-config'
import type { Audience } from '@/payload-types'
import { toContact } from '@/lib/app-api/contacts'
import { isRoleSlug } from '@/lib/app-api/config'
import { linkToHref } from '@/lib/app-api/links'
import type { ContactDto, LinkDto, RoleSlug } from '@/lib/app-api/types'

/** The "Voor jou" pages in site order, with contact person and photo populated. */
export async function loadAudiences(): Promise<Audience[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'audiences',
    sort: 'order',
    depth: 2,
    limit: 50,
    pagination: false,
  })
  return docs
}

/** The roles of the app. Only audiences whose slug is a role the contract knows. */
export const rolesOf = (audiences: Audience[]) =>
  audiences.flatMap((a) =>
    isRoleSlug(a.slug) ? [{ slug: a.slug as RoleSlug, title: a.cardTitle }] : [],
  )

/** The contact person of an audience. Function: the override on the audience, else the person's first function. */
export function audienceContact(audience: Audience): ContactDto | undefined {
  const person = audience.contact?.person
  if (!person || typeof person !== 'object') {
    return undefined
  }
  const dto = toContact(person)
  return audience.contact?.label ? { ...dto, role: audience.contact.label } : dto
}

/** Every link of the audience's theme groups, once each, in page order. */
export function audienceLinks(audience: Audience): LinkDto[] {
  const seen = new Set<string>()
  const links: LinkDto[] = []
  for (const theme of audience.themes ?? []) {
    for (const item of theme.links ?? []) {
      if (seen.has(item.href)) {
        continue
      }
      seen.add(item.href)
      links.push(linkToHref(item.title, item.href, item.description))
    }
  }
  return links
}

export const audienceQuestions = (audience: Audience) =>
  (audience.faq ?? []).map((item) => item.question)
