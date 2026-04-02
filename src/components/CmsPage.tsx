import React from 'react'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import CtaBlockComponent from '@/blocks/CtaBlock/Component'
import type { Page } from '@/payload-types'

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
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
}

export default function CmsPage({ title, section, sectionLabel, content }: Props) {
  return (
    <main className="static-page">
      <SetBreadcrumb
        crumbs={[{ label: 'Home', href: '/' }, { label: sectionLabel }, { label: title }]}
      />

      <div className="static-page-inner">
        <h1 className="programma-title">{title}</h1>
        {content && (
          <div className="static-page-body">
            <RichText data={content} converters={jsxConverters} />
          </div>
        )}
      </div>
    </main>
  )
}
