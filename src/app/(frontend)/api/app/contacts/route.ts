import { CLUB_ACCOMMODATION, CLUB_BANK, MEMBERSHIP_ROLE_SLUG, SECRETARIAT_ROLE_SLUG } from '@/lib/app-api/config'
import { findContactByRole, loadContacts, roleKey, toContact } from '@/lib/app-api/contacts'
import { appRoute, TTL } from '@/lib/app-api/http'

export const dynamic = 'force-dynamic'

export const GET = appRoute(TTL.content, async () => {
  const contacts = await loadContacts()

  // One topic per function with a contact topic, as in the contact form on the website.
  const topics = contacts
    .filter((c) => c.showInContactForm)
    .flatMap((c) =>
      (c.roles ?? [])
        .filter((role) => role.topic)
        .map((role) => ({ slug: roleKey(role), title: role.topic!, contact: toContact(c, role) })),
    )

  const fixedContact = (slug: string) => {
    const found = findContactByRole(contacts, slug)
    return found ? toContact(found.contact, found.role) : undefined
  }
  const secretariat = fixedContact(SECRETARIAT_ROLE_SLUG)
  const membership = fixedContact(MEMBERSHIP_ROLE_SLUG)

  return {
    topics,
    fixed: {
      accommodation: CLUB_ACCOMMODATION,
      ...(secretariat ? { secretariat } : {}),
      ...(membership ? { membership } : {}),
      bank: CLUB_BANK,
    },
  }
})
