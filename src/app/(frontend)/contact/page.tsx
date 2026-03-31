import React from 'react'
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export const metadata = { title: "Contact — SVV'04 Schoonebeek" }

const CONTACT_SECTIONS = [
  {
    title: 'Accommodatie',
    items: [
      { type: 'address', value: 'De Kampen 18, 7761 CK Schoonebeek' },
      { type: 'phone', value: '0524-531656' },
    ],
  },
  {
    title: 'Secretariaat',
    persons: [
      {
        name: 'Wietske Meppelink',
        role: 'Secretaris',
        phone: '06-12976201',
        email: 'secretaris@svv04.nl',
      },
    ],
  },
  {
    title: 'Wedstrijdsecretariaat',
    persons: [
      {
        name: 'Harko Elzing',
        role: 'Wedstrijdsecretariaat Algemeen',
        phone: '06-30214051',
        email: 'wedstrijdsecretaris@svv04.nl',
      },
    ],
  },
  {
    title: 'Bankrelatie',
    items: [
      { type: 'bank', value: 'Rabobank: NL02 RABO 0358304342' },
    ],
  },
]

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function AddressIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  )
}

function BankIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

export default function ContactPage() {
  return (
    <main className="contact-page">

      <nav className="team-breadcrumb" aria-label="Kruimelpad">
        <div className="team-page-inner">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Contact</span>
        </div>
      </nav>

      <div className="team-page-inner contact-inner">

        <div className="contact-header">
          <div>
            <h1 className="programma-title">Contact</h1>
            <p className="contact-intro">
              Heb je een vraag of opmerking? Neem gerust contact met ons op. We staan klaar om je snel te helpen.
            </p>
          </div>
        </div>

        <div className="contact-layout">

          {/* Left: contact form */}
          <div className="contact-form-panel">
            <h2 className="contact-panel-title">Contactformulier</h2>
            <ContactForm />
          </div>

          {/* Right: contact info */}
          <aside className="contact-info-panel">
            {CONTACT_SECTIONS.map((section) => (
              <div key={section.title} className="contact-section">
                <h2 className="contact-section-title">{section.title}</h2>

                {section.items?.map((item, i) => (
                  <div key={i} className="contact-info-row">
                    {item.type === 'phone' && (
                      <>
                        <PhoneIcon />
                        <a href={`tel:${item.value.replace(/\s/g, '')}`}>{item.value}</a>
                      </>
                    )}
                    {item.type === 'email' && (
                      <>
                        <EmailIcon />
                        <a href={`mailto:${item.value}`}>{item.value}</a>
                      </>
                    )}
                    {item.type === 'address' && (
                      <>
                        <AddressIcon />
                        <span>{item.value}</span>
                      </>
                    )}
                    {item.type === 'bank' && (
                      <>
                        <BankIcon />
                        <span>{item.value}</span>
                      </>
                    )}
                  </div>
                ))}

                {section.persons?.map((person, i) => (
                  <div key={i} className="contact-person">
                    <div className="contact-info-row contact-info-row--name">
                      <PersonIcon />
                      <span className="contact-person-name">{person.name}</span>
                    </div>
                    {person.role && (
                      <p className="contact-person-role">{person.role}</p>
                    )}
                    {person.phone && (
                      <div className="contact-info-row">
                        <PhoneIcon />
                        <a href={`tel:${person.phone.replace(/\s/g, '')}`}>{person.phone}</a>
                      </div>
                    )}
                    {person.email && (
                      <div className="contact-info-row">
                        <EmailIcon />
                        <a href={`mailto:${person.email}`}>{person.email}</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </aside>

        </div>
      </div>
    </main>
  )
}
