import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd'
import { AudienceHero } from '@/components/audience/AudienceHero'
import { AudienceThemes } from '@/components/audience/AudienceThemes'
import { AudienceFaq } from '@/components/audience/AudienceFaq'
import { AudienceClosing } from '@/components/audience/AudienceClosing'
import type { Audience } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

async function getAudience(slug: string): Promise<Audience | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'audiences',
    where: { slug: { equals: slug } },
    limit: 1,
    // Depth 2: hero image, contact person and the person's photo must be populated.
    depth: 2,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const audience = await getAudience(slug)
  if (!audience) return {}

  const title = audience.metaTitle || `Alles voor ${audience.name} bij SVV'04 Schoonebeek`
  const description =
    audience.metaDescription || audience.intro || audience.cardDescription || undefined
  const url = `/${audience.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: "SVV'04 Schoonebeek",
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function AudiencePage({ params }: Props) {
  const { slug } = await params
  const audience = await getAudience(slug)

  if (!audience) notFound()
  const themes = audience.themes ?? []
  const faq = (audience.faq ?? []).map((item) => ({
    id: item.id ?? item.question,
    category: item.category,
    question: item.question,
    answer: item.answer,
    links: (item.links ?? []).map((l) => ({ id: l.id ?? l.href, label: l.label, href: l.href })),
  }))

  const capitalisedName = audience.name.charAt(0).toUpperCase() + audience.name.slice(1)
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Voor jou' },
    { label: capitalisedName },
  ]

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className="audience-page">
      {/* The breadcrumb is part of the hero, so the global breadcrumb bar stays off. */}
      <BreadcrumbJsonLd items={crumbs.map((c) => ({ name: c.label, href: c.href }))} />
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          // Escape "<" so editor content can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
        />
      )}

      <AudienceHero audience={audience} crumbs={crumbs} />

      {audience.body && (
        <div className="audience-section">
          <div className="audience-body static-page-body">
            <RichText data={audience.body} />
          </div>
        </div>
      )}

      {themes.length > 0 && (
        <div className="audience-section">
          <AudienceThemes themes={themes} />
        </div>
      )}

      <AudienceFaq
        name={audience.name}
        items={faq}
        help={
          audience.faqHelp
            ? {
                title: audience.faqHelp.title,
                text: audience.faqHelp.text,
                links: (audience.faqHelp.links ?? []).map((l) => ({
                  id: l.id ?? l.href,
                  label: l.label,
                  href: l.href,
                })),
              }
            : undefined
        }
      />

      <div className="audience-section audience-section--padded">
        <AudienceClosing audience={audience} />
      </div>
    </main>
  )
}
