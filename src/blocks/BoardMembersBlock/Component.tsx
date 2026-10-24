import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Contact, Media } from '@/payload-types'
import { PhoneIcon, EmailIcon } from '@/components/ui/ContactIcons'
import { contactEmailHref } from '@/lib/contact-links'

type Area = {
  heading?: string | null
  items?: { text?: string | null }[] | null
}

type Member = {
  contact?: Contact | number | string | null
  role?: string | null
  areas?: Area[] | null
}

type Props = {
  members?: Member[] | null
}

function contactId(contact: Member['contact']): number | string | null {
  if (contact == null) return null
  return typeof contact === 'object' ? contact.id : contact
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default async function BoardMembersBlockComponent({ members }: Props) {
  const ids = (members ?? []).map((m) => contactId(m.contact)).filter((id) => id != null)
  if (ids.length === 0) return null

  // Fetched here rather than relying on the page query's depth: the portrait is two
  // relationships deep (block -> contact -> media).
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'contacts',
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
    pagination: false,
  })
  const byId = new Map(docs.map((c) => [String(c.id), c]))

  const resolved = (members ?? [])
    .map((m) => ({ member: m, contact: byId.get(String(contactId(m.contact))) }))
    .filter((r): r is { member: Member; contact: Contact } => Boolean(r.contact))

  if (resolved.length === 0) return null

  return (
    <ul className="board-members">
      {resolved.map(({ member, contact }) => {
        const role = member.role || contact.roles?.[0]?.title
        const photo = typeof contact.photo === 'object' ? (contact.photo as Media) : null
        const photoUrl = photo?.sizes?.teamCard?.url ?? photo?.url
        const areas = (member.areas ?? []).filter((a) => (a.items ?? []).some((i) => i.text))

        return (
          <li className="board-member" key={contact.id}>
            <div className="board-member-photo">
              {photoUrl ? (
                <img alt="" height={128} loading="lazy" src={photoUrl} width={128} />
              ) : (
                <span aria-hidden="true">{initials(contact.name)}</span>
              )}
            </div>

            <div className="board-member-body">
              <h3 className="board-member-name">{contact.name}</h3>
              {role && <p className="board-member-role">{role}</p>}

              {areas.length > 0 && (
                <div className="board-member-areas">
                  {areas.map((area, i) => (
                    <div className="board-member-area" key={i}>
                      {area.heading && <p className="board-member-area-heading">{area.heading}</p>}
                      <ul className="board-member-chips">
                        {(area.items ?? [])
                          .filter((item) => item.text)
                          .map((item, j) => (
                            <li key={j}>{item.text}</li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {(contact.phone || contact.email) && (
                <div className="board-member-contact">
                  {contact.phone && (
                    <a href={`tel:${contact.phone.replace(/[\s-]/g, '')}`}>
                      <PhoneIcon />
                      {contact.phone}
                    </a>
                  )}
                  {contact.email && (
                    <a href={contactEmailHref(contact)}>
                      <EmailIcon />
                      {contact.email}
                    </a>
                  )}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
