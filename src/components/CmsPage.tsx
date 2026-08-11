import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd'
import CtaBlockComponent from '@/blocks/CtaBlock/Component'
import ContactBlockComponent from '@/blocks/ContactBlock/Component'
import type { Page } from '@/payload-types'
import { defaultJSXConverters } from '@/lib/richtext'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { SectionHeader } from './ui/SectionHeader'

const jsxConverters: JSXConvertersFunction = (args) => ({
  ...defaultJSXConverters(args),
  blocks: {
    ctaBlock: ({ node }: { node: any }) => (
      <CtaBlockComponent buttonLabel={node.fields.buttonLabel} buttonUrl={node.fields.buttonUrl} />
    ),
    contactBlock: ({ node }: { node: any }) => (
      <ContactBlockComponent heading={node.fields.heading} contacts={node.fields.contacts} />
    ),
  },
})

type Props = {
  title: string
  section: 'vereniging' | 'commissies' | 'meedoen'
  sectionLabel: string
  content: Page['content']
  showSubpageMenu?: boolean
  slug?: string
}

export default async function CmsPage({
  title,
  section,
  sectionLabel,
  content,
  showSubpageMenu = true,
  slug,
}: Props) {
  let sectionPages: { id: string; title: string; slug: string }[] = []

  if (showSubpageMenu) {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pages',
      where: { section: { equals: section } },
      sort: 'title',
      limit: 100,
      depth: 0,
    })
    sectionPages = docs.map((p) => ({ id: String(p.id), title: p.title, slug: p.slug ?? '' }))
  }

  const crumbs = [{ label: 'Home', href: '/' }, { label: sectionLabel }, { label: title }]

  return (
    <main className="page">
      <SetBreadcrumb crumbs={crumbs} />
      <BreadcrumbJsonLd
        items={crumbs.map((c) => ({ name: c.label, href: (c as { href?: string }).href }))}
      />

      {showSubpageMenu ? (
        <div className="section-with-sidebar">
          <div className="sidebar-content-col">
            <div className="static-page-body">
              <SectionHeader as="h1" title={title} />
              {content && <RichText data={content} converters={jsxConverters} />}
            </div>
          </div>
          <div className="sidebar-col">
            <div className="sidebar-col__inner">
              <nav aria-label={sectionLabel}>
                <div className="sidebar-section">
                  <h2 className="sidebar-section-title">{sectionLabel} pagina&apos;s</h2>
                  <ul className="cms-page-nav-list">
                    {sectionPages.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/${section}/${p.slug}`}
                          className={`cms-page-nav-link${p.slug === slug ? ' cms-page-nav-link--active' : ''}`}
                        >
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      ) : (
        content && (
          <div className="page-inner">
            <SectionHeader as="h1" title={title} />
            <div className="static-page-body">
              <RichText data={content} converters={jsxConverters} />
            </div>
          </div>
        )
      )}
    </main>
  )
}
