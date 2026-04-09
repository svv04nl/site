import React from 'react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

function resolveInternalUrl(relationTo: string, doc: any): string {
  if (!doc || typeof doc !== 'object') return '#'

  switch (relationTo) {
    case 'pages':
      return `/${doc.section}/${doc.slug}`
    case 'posts':
      return `/nieuws/${doc.slug}`
    case 'teams':
      return `/teams/${doc.slug}`
    default:
      return '#'
  }
}

export const defaultJSXConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: (node as any).children })
    const fields = (node as any).fields ?? {}
    const rel = fields.newTab ? 'noopener noreferrer' : undefined
    const target = fields.newTab ? '_blank' : undefined

    let href = '#'
    if (fields.linkType === 'internal' && fields.doc?.relationTo) {
      href = resolveInternalUrl(fields.doc.relationTo, fields.doc.value)
    } else {
      // quickLink takes precedence over manually typed URL
      href = fields.quickLink || fields.url || '#'
    }

    return (
      <a href={href} rel={rel} target={target}>
        {children}
      </a>
    )
  },
})
