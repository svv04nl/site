import React from 'react'
import Link from 'next/link'
import type { Audience, Contact, Media } from '@/payload-types'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

// The whole card is one mailto link when the contact has an e-mail address.
function ContactCard({
  email,
  className,
  children,
}: {
  email?: string | null
  className: string
  children: React.ReactNode
}) {
  return email ? (
    <a href={`mailto:${email}`} className={className}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  )
}

// Closing row: the contact person (with a heading above) next to the red CTA banner.
export function AudienceClosing({ audience }: { audience: Audience }) {
  const person =
    typeof audience.contact?.person === 'object' ? (audience.contact.person as Contact) : null
  const cta = audience.cta?.enabled ? audience.cta : null
  if (!person && !cta) return null

  const photo = person?.photo as Media | null | undefined
  const heading = audience.faqHelp?.title

  return (
    <div className="audience-closing">
      {person && (
        <ContactCard
          email={person.email}
          className={`audience-contact${person.email ? ' audience-contact--link' : ''}`}
        >
          {heading && <p className="audience-contact-heading">{heading}</p>}
          <div className="audience-contact-person">
            {photo?.url ? (
              <img src={photo.url} alt="" className="audience-contact-photo" />
            ) : (
              <span className="audience-contact-photo audience-contact-initials" aria-hidden="true">
                {initials(person.name)}
              </span>
            )}
            <div className="audience-contact-info">
              {audience.contact?.label && (
                <p className="audience-contact-label">{audience.contact.label}</p>
              )}
              <p className="audience-contact-name">{person.name}</p>
            </div>
            {person.email && (
              <span className="audience-contact-arrow" aria-hidden="true">
                &rarr;
              </span>
            )}
          </div>
        </ContactCard>
      )}

      {cta && (
        <section className="audience-cta">
          <div className="audience-cta-text">
            {cta.title && <h2 className="audience-cta-title">{cta.title}</h2>}
            {cta.text && <p className="audience-cta-desc">{cta.text}</p>}
          </div>
          {cta.buttonUrl && cta.buttonLabel && (
            <Link className="btn btn--light btn--lg" href={cta.buttonUrl}>
              {cta.buttonLabel} &rarr;
            </Link>
          )}
        </section>
      )}
    </div>
  )
}
