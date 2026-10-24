import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd'
import type { Page } from '@/payload-types'
import { cmsJsxConverters as jsxConverters } from '@/lib/cms-richtext'
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
