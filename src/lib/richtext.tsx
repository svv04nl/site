import React from 'react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import GalleryBlockComponent from '@/blocks/GalleryBlock/Component'
import { pageHref } from '@/lib/pages'

function resolveInternalUrl(relationTo: string, doc: any): string {
  if (!doc || typeof doc !== 'object') {
    return '#'
  }

  switch (relationTo) {
    case 'pages':
      return pageHref(doc)
    case 'posts':
      return `/nieuws/${doc.slug}`
    case 'teams':
      return `/teams/${doc.slug}`
    default:
      return '#'
  }
}

// Media sizes that keep the original aspect ratio. The cropped sizes (newsCard,
// featuredPost, hero) must not be used for images inside content: Payload's
// default <picture> converter would pick them and crop the image to 2:1 / 12:5.
const RATIO_PRESERVING_SIZES = ['teamCard', 'teamPhoto'] as const

function uploadImage(doc: any, alt: string) {
  const candidates: { url: string; width: number }[] = []
  for (const name of RATIO_PRESERVING_SIZES) {
    const size = doc.sizes?.[name]
    if (size?.url && size.width) {
      candidates.push({ url: size.url, width: size.width })
    }
  }
  if (doc.url && doc.width) {
    candidates.push({ url: doc.url, width: doc.width })
  }
  candidates.sort((a, b) => a.width - b.width)

  return (
    <img
      alt={alt}
      height={doc.height ?? undefined}
      loading="lazy"
      sizes="(max-width: 900px) 100vw, 900px"
      src={doc.url}
      srcSet={candidates.map((c) => `${c.url} ${c.width}w`).join(', ') || undefined}
      width={doc.width ?? undefined}
    />
  )
}

export const defaultJSXConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // Blocks that render everywhere richText is used (news posts and CMS pages).
  blocks: {
    galleryBlock: ({ node }: { node: any }) => (
      <GalleryBlockComponent images={node.fields.images} />
    ),
  },
  upload: ({ node }) => {
    const doc = (node as any).value
    if (!doc || typeof doc !== 'object') {
      return null
    }
    const alt = (node as any).fields?.alt || doc.alt || ''
    if (!doc.mimeType?.startsWith('image')) {
      return (
        <a href={doc.url} rel="noopener noreferrer">
          {doc.filename}
        </a>
      )
    }
    return uploadImage(doc, alt)
  },
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
