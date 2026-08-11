import React from 'react'
import type { Contact } from '@/payload-types'
import { PersonIcon, PhoneIcon, EmailIcon } from './ContactIcons'

type Props = {
  contact: Pick<Contact, 'name' | 'role' | 'phone' | 'email'>
}

/** Enkele contactpersoon met icons — gedeeld door de contactpagina en het ContactBlock. */
export function ContactPerson({ contact }: Props) {
  return (
    <div className="contact-person">
      <div className="contact-info-row contact-info-row--name">
        <PersonIcon />
        <span className="contact-person-name">{contact.name}</span>
      </div>
      {contact.role && <p className="contact-person-role">{contact.role}</p>}
      {contact.phone && (
        <div className="contact-info-row">
          <PhoneIcon />
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
        </div>
      )}
      {contact.email && (
        <div className="contact-info-row">
          <EmailIcon />
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </div>
      )}
    </div>
  )
}
