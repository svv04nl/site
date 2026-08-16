import React from 'react'
import Link from 'next/link'
import type { Contact } from '@/payload-types'
import { PersonIcon, PhoneIcon, EmailIcon } from './ContactIcons'

type Props = {
  contact: Pick<Contact, 'name' | 'roles' | 'phone' | 'email'>
  /** Link het e-mailadres naar het contactformulier met dit contact voorgeselecteerd, in plaats van een mailto-link. */
  linkEmailToContactForm?: boolean
  /** 'card' = compacte, horizontale kaart (ContactBlock). 'stack' = verticale lijst (contactpagina). */
  layout?: 'card' | 'stack'
}

/** Enkele contactpersoon met icons — gedeeld door de contactpagina en het ContactBlock. */
export function ContactPerson({ contact, linkEmailToContactForm, layout = 'stack' }: Props) {
  const roles = contact.roles ?? []
  const roleLabel = roles.length > 0 ? roles.map((r) => r.title).join(', ') : null
  // Linken gebeurt via de slug van de functie, niet via de persoon.
  const primaryRoleSlug = roles[0]?.slug || roles[0]?.title
  const emailHref = linkEmailToContactForm
    ? `/contact?afdeling=${encodeURIComponent(primaryRoleSlug || contact.name)}`
    : `mailto:${contact.email}`

  if (layout === 'card') {
    return (
      <Link href={emailHref} className="contact-person-card">
        <div className="contact-person-card-who">
          <PersonIcon />
          <div>
            <div className="contact-person-name">{roleLabel || contact.name}</div>
            {roleLabel && <div className="contact-person-role">{contact.name}</div>}
          </div>
        </div>
        <div className="contact-person-card-details">
          {contact.phone && (
            <span className="contact-info-row">
              <PhoneIcon />
              {contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="contact-info-row">
              <EmailIcon />
              {contact.email}
            </span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <div className="contact-person">
      <div className="contact-info-row contact-info-row--name">
        <PersonIcon />
        <span className="contact-person-name">{roleLabel || contact.name}</span>
      </div>
      {roleLabel && <p className="contact-person-role">{contact.name}</p>}
      {contact.phone && (
        <div className="contact-info-row">
          <PhoneIcon />
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
        </div>
      )}
      {contact.email && (
        <div className="contact-info-row">
          <EmailIcon />
          <a href={emailHref}>{contact.email}</a>
        </div>
      )}
    </div>
  )
}
