import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Contact } from '@/payload-types'
import { PhoneIcon, EmailIcon } from '@/components/ui/ContactIcons'
import { contactEmailHref } from '@/lib/contact-links'

type Unit = {
  title?: string | null
  people?: { name?: string | null; note?: string | null }[] | null
  contact?: Contact | number | string | null
  email?: string | null
}

type Props = {
  units?: Unit[] | null
}

function contactId(contact: Unit['contact']): number | string | null {
  if (contact == null) {
    return null
  }
  return typeof contact === 'object' ? contact.id : contact
}

export default async function TeamDirectoryBlockComponent({ units }: Props) {
  const resolvedUnits = (units ?? []).filter((u) => u.title)
  if (resolvedUnits.length === 0) {
    return null
  }

  const ids = resolvedUnits.map((u) => contactId(u.contact)).filter((id) => id != null)
  const byId = new Map<string, Contact>()
  if (ids.length > 0) {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'contacts',
      where: { id: { in: ids } },
      depth: 0,
      limit: ids.length,
      pagination: false,
    })
    docs.forEach((c) => byId.set(String(c.id), c))
  }

  return (
    <ul className="directory">
      {resolvedUnits.map((unit, i) => {
        const contact = byId.get(String(contactId(unit.contact)))
        const people = (unit.people ?? []).filter((p) => p.name)
        // A linked contact supplies the name when none is listed explicitly.
        const names =
          people.length > 0 ? people : contact ? [{ name: contact.name, note: null }] : []
        const phone = contact?.phone
        const email = contact?.email ?? unit.email

        return (
          <li className="directory-unit" key={i}>
            <h3 className="directory-unit-title">{unit.title}</h3>
            {names.length > 0 && (
              <ul className="directory-people">
                {names.map((p, j) => (
                  <li key={j}>
                    {p.name}
                    {p.note && <span className="directory-person-note"> ({p.note})</span>}
                  </li>
                ))}
              </ul>
            )}
            {(phone || email) && (
              <div className="directory-contact">
                {phone && (
                  <a href={`tel:${phone.replace(/[\s-]/g, '')}`}>
                    <PhoneIcon />
                    {phone}
                  </a>
                )}
                {email && (
                  <a href={contact ? contactEmailHref(contact) : `mailto:${email}`}>
                    <EmailIcon />
                    {email}
                  </a>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
