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

// Closing row: the contact person (with a heading above) next to the red CTA banner.
export function AudienceClosing({ audience }: { audience: Audience }) {
  const person =
    typeof audience.contact?.person === 'object' ? (audience.contact.person as Contact) : null
  const cta = audience.cta?.enabled ? audience.cta : null
  if (!person && !cta) {
    return null
  }

  const photo = person?.photo as Media | null | undefined
  const heading = audience.faqHelp?.title
  // The person's function (e.g. "Coördinator jeugd"); the audience label only overrides it.
  const role = audience.contact?.label || person?.roles?.[0]?.title
  // The card opens the contact form with this person's topic preselected (same value the form uses).
  const topicRole = person?.roles?.find((r) => r.topic)
  const contactHref = topicRole
    ? `/contact?afdeling=${encodeURIComponent(topicRole.slug || topicRole.title)}`
    : '/contact'

  return (
    <div className="audience-closing">
      {person && (
        <Link href={contactHref} className="audience-contact audience-contact--link">
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
              {role && <p className="audience-contact-label">{role}</p>}
              <p className="audience-contact-name">{person.name}</p>
            </div>
            <span className="audience-contact-arrow" aria-hidden="true">
              &rarr;
            </span>
          </div>
        </Link>
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
