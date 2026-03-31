import React from 'react'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import CtaBlockComponent from '@/blocks/CtaBlock/Component'
import type { Page } from '@/payload-types'

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    ctaBlock: ({ node }: { node: any }) => (
      <CtaBlockComponent
        buttonLabel={node.fields.buttonLabel}
        buttonUrl={node.fields.buttonUrl}
      />
    ),
  },
})

type Props = {
  title: string
  section: 'vereniging' | 'commissies' | 'meedoen'
  sectionLabel: string
  content: Page['content']
  ctaBlock?: Page['ctaBlock']
}

export default function CmsPage({ title, section, sectionLabel, content, ctaBlock }: Props) {
  return (
    <main className="static-page">
      <nav className="team-breadcrumb" aria-label="Kruimelpad">
        <div className="team-page-inner">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>{sectionLabel}</span>
          <span aria-hidden="true">›</span>
          <span>{title}</span>
        </div>
      </nav>

      <div className="static-page-inner">
        <h1 className="programma-title">{title}</h1>
        {content && (
          <div className="static-page-body">
            <RichText data={content} converters={jsxConverters} />
          </div>
        )}
        {ctaBlock?.enabled && ctaBlock.buttonLabel && ctaBlock.buttonUrl && (
          <div className="static-page-cta">
            <a href={ctaBlock.buttonUrl} className="cta-button" target="_blank" rel="noopener noreferrer">
              {ctaBlock.buttonLabel}
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
