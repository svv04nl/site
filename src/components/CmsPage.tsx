import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import CtaBlockComponent from '@/blocks/CtaBlock/Component'
import { Sidebar } from '@/components/ui/Sidebar'
import type { Page } from '@/payload-types'
import { defaultJSXConverters } from '@/lib/richtext'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

const jsxConverters: JSXConvertersFunction = (args) => ({
  ...defaultJSXConverters(args),
  blocks: {
    ctaBlock: ({ node }: { node: any }) => (
      <CtaBlockComponent buttonLabel={node.fields.buttonLabel} buttonUrl={node.fields.buttonUrl} />
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

  return (
    <main className="page">
      <SetBreadcrumb
        crumbs={[{ label: 'Home', href: '/' }, { label: sectionLabel }, { label: title }]}
      />

      {showSubpageMenu ? (
        <div className="page-inner cms-page-layout">
          <div className="cms-page-content">
            <h1 className="page-title">{title}</h1>
            {content && (
              <div className="static-page-body">
                <RichText data={content} converters={jsxConverters} />
              </div>
            )}
          </div>

          <Sidebar>
            <nav aria-label={sectionLabel}>
              <p className="cms-page-nav-label">{sectionLabel} pagina&apos;s</p>
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
            </nav>
          </Sidebar>
        </div>
      ) : (
        <div className="page-inner">
          <h1 className="page-title">{title}</h1>
          {content && (
            <div className="static-page-body">
              <RichText data={content} converters={jsxConverters} />
            </div>
          )}
        </div>
      )}
    </main>
  )
}
