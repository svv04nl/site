import { getPayload } from 'payload'
import config from '@payload-config'
import type { Contact } from '@/payload-types'
import { toE164 } from '@/lib/app-api/format'
import { toImage } from '@/lib/app-api/media'
import type { ContactDto } from '@/lib/app-api/types'

type ContactRole = NonNullable<Contact['roles']>[number]

/** The key the contact form and `?afdeling=` use for a role. Same rule as the contact page. */
export const roleKey = (role: ContactRole) => role.slug || role.title

/**
 * A contact as the app shows it. `role` picks one of the person's functions (default: the first).
 * Phone and e-mail are what the contact record holds, and the site shows the same on /contact.
 * `whatsapp` is left out: the contact record has no consent field for it yet.
 */
export function toContact(contact: Contact, role?: ContactRole): ContactDto {
  const shownRole = role ?? contact.roles?.[0]
  const phone = toE164(contact.phone)
  const photo = toImage(contact.photo, 'teamCard')
  return {
    name: contact.name,
    role: shownRole?.title ?? '',
    ...(photo ? { photo } : {}),
    ...(phone ? { phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
  }
}

/** All contacts in the order of the contact page, with their photo populated. */
export async function loadContacts(): Promise<Contact[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'contacts',
    sort: 'order',
    depth: 1,
    limit: 100,
    pagination: false,
  })
  return docs
}

export function findContactByRole(contacts: Contact[], slug: string) {
  for (const contact of contacts) {
    const role = contact.roles?.find((r) => roleKey(r) === slug)
    if (role) {
      return { contact, role }
    }
  }
  return undefined
}
