import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import ContactForm from '@/components/ContactForm'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ContactPerson } from '@/components/ui/ContactPerson'
import { PhoneIcon, AddressIcon, BankIcon } from '@/components/ui/ContactIcons'
import type { Contact } from '@/payload-types'
import { ACCOMMODATIE, BANKRELATIE } from '@/lib/club-info'

export const metadata = { title: "SVV'04 - Contact" }

type Props = {
  searchParams: Promise<{ afdeling?: string }>
}

export default async function ContactPage({ searchParams }: Props) {
  const { afdeling: defaultAfdeling } = await searchParams
  const payload = await getPayload({ config })

  const { docs: contacts } = await payload.find({
    collection: 'contacts',
    limit: 100,
    sort: 'order',
    depth: 0,
  })

  // Contactformulier: één optie per functie (niet per persoon), alleen voor
  // functies met een contactonderwerp (topic) — dat is wat een bezoeker
  // herkent, niet elke functienaam op zich. Linken gebeurt via de slug.
  const afdelingen = contacts
    .filter((c) => c.showInContactForm)
    .flatMap((c) =>
      (c.roles ?? [])
        .filter((r) => r.topic)
        .map((r) => ({
          label: `${r.topic} (${r.title})`,
          value: r.slug || r.title,
          name: c.name,
          phone: c.phone,
          email: c.email,
        })),
    )

  // Groepeer contacten op hun "group"-kopje, in de volgorde waarin de groepen
  // voor het eerst voorkomen (contacten zijn al op `order` gesorteerd).
  const groups: { title: string; persons: Contact[] }[] = []
  for (const contact of contacts) {
    if (contact.showOnContactPage === false) continue
    const title = contact.group?.trim() || 'Contact'
    let group = groups.find((g) => g.title === title)
    if (!group) {
      group = { title, persons: [] }
      groups.push(group)
    }
    group.persons.push(contact)
  }

  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />

      <div className="section-with-sidebar">
        {/* Left: form */}
        <div className="sidebar-content-col sidebar-content-col--no-gap">
          <SectionHeader as="h1" title="Contact" />
          <p className="contact-intro">
            Heb je een vraag of opmerking? Neem gerust contact met ons op. We staan klaar om je snel
            te helpen.
          </p>
          <ContactForm afdelingen={afdelingen} defaultAfdeling={defaultAfdeling} />
        </div>

        {/* Right: contact details */}
        <div className="sidebar-col">
          <div className="sidebar-col__inner">
            <div>
              {/* Accommodatie (statisch) */}
              <div className="contact-section">
                <h2 className="contact-section-title">{ACCOMMODATIE.title}</h2>
                {ACCOMMODATIE.items.map((item, i) => (
                  <div key={i} className="contact-info-row">
                    {item.type === 'phone' ? (
                      <>
                        <PhoneIcon />
                        <a href={`tel:${item.value.replace(/\s/g, '')}`}>{item.value}</a>
                      </>
                    ) : (
                      <>
                        <AddressIcon />
                        <span>{item.value}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Contactpersonen (uit de database) */}
              {groups.map((group) => (
                <div key={group.title} className="contact-section">
                  <h2 className="contact-section-title">{group.title}</h2>
                  {group.persons.map((person) => (
                    <ContactPerson key={person.id} contact={person} />
                  ))}
                </div>
              ))}

              {/* Bankrelatie (statisch) */}
              <div className="contact-section">
                <h2 className="contact-section-title">{BANKRELATIE.title}</h2>
                {BANKRELATIE.items.map((item, i) => (
                  <div key={i} className="contact-info-row">
                    <BankIcon />
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
