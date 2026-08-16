import React from 'react'
import type { Contact } from '@/payload-types'
import { ContactPerson } from '@/components/ui/ContactPerson'

type Props = {
  heading?: string | null
  contacts?: (Contact | number | string)[] | null
}

export default function ContactBlockComponent({ heading, contacts }: Props) {
  const resolved = (contacts ?? []).filter(
    (c): c is Contact => typeof c === 'object' && c !== null,
  )

  if (resolved.length === 0) return null

  return (
    <div className="contact-block">
      {heading && <h2 className="contact-section-title">{heading}</h2>}
      {resolved.map((contact) => (
        <ContactPerson key={contact.id} contact={contact} linkEmailToContactForm layout="card" />
      ))}
    </div>
  )
}
