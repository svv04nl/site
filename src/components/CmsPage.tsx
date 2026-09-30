import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd'
import CtaBlockComponent from '@/blocks/CtaBlock/Component'
import ContactBlockComponent from '@/blocks/ContactBlock/Component'
import PricingTableBlockComponent from '@/blocks/PricingTableBlock/Component'
import QrCodeBlockComponent from '@/blocks/QrCodeBlock/Component'
import AppStoreButtonsBlockComponent from '@/blocks/AppStoreButtonsBlock/Component'
import AddressBlockComponent from '@/blocks/AddressBlock/Component'
import TaskTableBlockComponent from '@/blocks/TaskTableBlock/Component'
import QuoteBlockComponent from '@/blocks/QuoteBlock/Component'
import DocumentDownloadBlockComponent from '@/blocks/DocumentDownloadBlock/Component'
import type { Page } from '@/payload-types'
import { defaultJSXConverters } from '@/lib/richtext'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { SectionHeader } from './ui/SectionHeader'

type NavPage = { id: string; title: string; slug: string; children: NavPage[] }

function buildNavTree(
  docs: { id: string | number; title: string; slug?: string | null; parent?: unknown }[],
): NavPage[] {
  const byId = new Map<string, NavPage>()
  docs.forEach((p) =>
    byId.set(String(p.id), { id: String(p.id), title: p.title, slug: p.slug ?? '', children: [] }),
  )

  const topLevel: NavPage[] = []
  docs.forEach((p) => {
    const node = byId.get(String(p.id))!
    const parentRef = p.parent as { id?: string | number } | string | number | null | undefined
    const parentId =
      parentRef && typeof parentRef === 'object'
        ? String(parentRef.id)
        : parentRef
          ? String(parentRef)
          : null
    const parentNode = parentId ? byId.get(parentId) : undefined
    if (parentNode) {
      parentNode.children.push(node)
    } else {
      topLevel.push(node)
    }
  })

  return topLevel
}

function NavList({
  pages,
  basePath,
  activeSlug,
}: {
  pages: NavPage[]
  basePath: string
  activeSlug?: string
}) {
  return (
    <ul className="cms-page-nav-list">
      {pages.map((p) => {
        const href = `${basePath}/${p.slug}`
        return (
          <li key={p.id}>
            <Link
              href={href}
              className={`cms-page-nav-link${p.slug === activeSlug ? ' cms-page-nav-link--active' : ''}`}
            >
              {p.title}
            </Link>
            {p.children.length > 0 && (
              <NavList pages={p.children} basePath={href} activeSlug={activeSlug} />
            )}
          </li>
        )
      })}
    </ul>
  )
}

const jsxConverters: JSXConvertersFunction = (args) => ({
  ...defaultJSXConverters(args),
  blocks: {
    ...defaultJSXConverters(args).blocks,
    ctaBlock: ({ node }: { node: any }) => (
      <CtaBlockComponent buttonLabel={node.fields.buttonLabel} buttonUrl={node.fields.buttonUrl} />
    ),
    contactBlock: ({ node }: { node: any }) => (
      <ContactBlockComponent heading={node.fields.heading} contacts={node.fields.contacts} />
    ),
    pricingTableBlock: ({ node }: { node: any }) => (
      <PricingTableBlockComponent rows={node.fields.rows} />
    ),
    qrCodeBlock: ({ node }: { node: any }) => (
      <QrCodeBlockComponent url={node.fields.url} label={node.fields.label} />
    ),
    appStoreButtonsBlock: ({ node }: { node: any }) => (
      <AppStoreButtonsBlockComponent
        appStoreUrl={node.fields.appStoreUrl}
        playStoreUrl={node.fields.playStoreUrl}
      />
    ),
    addressBlock: ({ node }: { node: any }) => (
      <AddressBlockComponent
        name={node.fields.name}
        address={node.fields.address}
        plusCode={node.fields.plusCode}
        mapsUrl={node.fields.mapsUrl}
        websiteUrl={node.fields.websiteUrl}
      />
    ),
    taskTableBlock: ({ node }: { node: any }) => (
      <TaskTableBlockComponent heading={node.fields.heading} rows={node.fields.rows} />
    ),
    quoteBlock: ({ node }: { node: any }) => <QuoteBlockComponent text={node.fields.text} />,
    documentDownloadBlock: ({ node }: { node: any }) => (
      <DocumentDownloadBlockComponent
        title={node.fields.title}
        description={node.fields.description}
        file={node.fields.file}
      />
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
  let sectionPages: NavPage[] = []

  if (showSubpageMenu) {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pages',
      where: {
        section: { equals: section },
        hideFromNav: { not_equals: true },
      },
      sort: 'title',
      limit: 200,
      depth: 0,
    })
    sectionPages = buildNavTree(docs)
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
                  <NavList pages={sectionPages} basePath={`/${section}`} activeSlug={slug} />
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
