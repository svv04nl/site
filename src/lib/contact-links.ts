import type { Contact } from '@/payload-types'

// Only roles with a contact topic show up in the contact form, so only those can be
// deep-linked. Everyone else gets a plain mailto link.
export function contactEmailHref(contact: Contact) {
  const role = contact.roles?.[0]
  if (role?.topic && contact.showInContactForm) {
    return `/contact?afdeling=${encodeURIComponent(role.slug || role.title)}`
  }
  return `mailto:${contact.email}`
}
