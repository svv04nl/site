import React from 'react'

const SITE_URL = 'https://svv04.nl'

export type BreadcrumbItem = { name: string; href?: string }

/**
 * Emits a schema.org BreadcrumbList as JSON-LD so Google can render breadcrumb
 * rich results and better understand the site hierarchy. Server-rendered into
 * the page so it is present in the initial HTML that crawlers read.
 *
 * The final crumb typically has no href (it is the current page); it is still
 * included as the last list item, per Google's guidelines.
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) {
    return null
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
