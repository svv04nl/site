'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export type AudienceFaqItem = {
  id: string
  category: string
  question: string
  answer: string
  links: { id: string; label: string; href: string }[]
}

export type AudienceFaqHelp = {
  title?: string | null
  text?: string | null
  links: { id: string; label: string; href: string }[]
}

const ALL = 'Alles'

// FAQ section with category filter and accordion answers. One answer is open at
// a time; switching category closes it. The answers stay in the DOM (hidden
// with visibility) so the content is in the initial HTML for crawlers.
export function AudienceFaq({
  name,
  items,
  help,
}: {
  name: string
  items: AudienceFaqItem[]
  help?: AudienceFaqHelp
}) {
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  if (items.length === 0) return null

  const categories = [ALL, ...Array.from(new Set(items.map((item) => item.category)))]
  const visible =
    activeCategory === ALL ? items : items.filter((i) => i.category === activeCategory)

  const selectCategory = (category: string) => {
    setActiveCategory(category)
    setOpenId(null)
  }

  return (
    <section className="audience-faq" id="faq" aria-labelledby="faq-title">
      <div className="audience-faq-inner">
        <div className="audience-faq-intro">
          <p className="audience-faq-eyebrow">Veelgestelde vragen</p>
          <h2 className="audience-faq-title" id="faq-title">
            Vragen van <span>{name}</span>
          </h2>
          <p className="audience-faq-text">
            Hieronder staan de vragen die we het vaakst krijgen. Bij elk antwoord staat een link
            naar de pagina met meer informatie.
          </p>

          {categories.length > 2 && (
            <div className="audience-faq-chips">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`audience-faq-chip${category === activeCategory ? ' is-active' : ''}`}
                  aria-pressed={category === activeCategory}
                  onClick={() => selectCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {help && (help.title || help.text || help.links.length > 0) && (
            <aside className="audience-faq-help">
              {help.title && <h3 className="audience-faq-help-title">{help.title}</h3>}
              {help.text && <p className="audience-faq-help-text">{help.text}</p>}
              {help.links.length > 0 && (
                <div className="audience-faq-help-links">
                  {help.links.map((link) => (
                    <Link key={link.id} href={link.href}>
                      {link.label} &rarr;
                    </Link>
                  ))}
                </div>
              )}
            </aside>
          )}
        </div>

        <div className="audience-faq-list">
          {visible.map((item) => {
            const isOpen = item.id === openId
            const buttonId = `faq-q-${item.id}`
            const panelId = `faq-a-${item.id}`
            return (
              <div key={item.id} className={`audience-faq-item${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  id={buttonId}
                  className="audience-faq-question"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                >
                  <span>
                    <span className="audience-faq-category">{item.category}</span>
                    <span className="audience-faq-question-text">{item.question}</span>
                  </span>
                  <span className="audience-faq-toggle" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="audience-faq-panel"
                >
                  <div className="audience-faq-panel-inner">
                    <p className="audience-faq-answer">{item.answer}</p>
                    {item.links.length > 0 && (
                      <div className="audience-faq-answer-links">
                        {item.links.map((link) => (
                          <Link key={link.id} href={link.href} className="audience-faq-answer-link">
                            {link.label} &rarr;
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
