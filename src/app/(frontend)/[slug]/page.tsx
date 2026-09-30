import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd'
import type { Audience } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

async function getAudience(slug: string): Promise<Audience | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'audiences',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
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
  const links = audience.links ?? []
  const cta = audience.cta

  const capitalisedName = audience.name.charAt(0).toUpperCase() + audience.name.slice(1)
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Voor jou' },
    { label: capitalisedName },
  ]

  return (
    <main className="page audience-page">
      <SetBreadcrumb crumbs={crumbs} />
      <BreadcrumbJsonLd items={crumbs.map((c) => ({ name: c.label, href: c.href }))} />

      <div className="page-inner">
        <header className="audience-header">
          <h1 className="audience-title">
            Alles voor <span className="audience-title-accent">{audience.name}</span>{' '}
            van <span className="audience-title-accent">SVV&rsquo;04</span>
          </h1>
          {audience.intro && <p className="audience-intro">{audience.intro}</p>}
        </header>

        {audience.body && (
          <div className="audience-body static-page-body">
            <RichText data={audience.body} />
          </div>
        )}

        {links.length > 0 && (
          <div className="audience-grid">
            {links.map((link) => (
              <Link key={link.id} href={link.href} className="audience-link-card">
                <h2 className="audience-link-title">{link.title}</h2>
                {link.description && (
                  <p className="audience-link-desc">{link.description}</p>
                )}
                <span className="audience-link-arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        )}

        {cta?.enabled && (
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
    </main>
  )
}
