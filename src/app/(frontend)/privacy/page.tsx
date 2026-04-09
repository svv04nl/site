import React from 'react'
import Link from 'next/link'
import { readFileSync } from 'fs'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'

export const metadata = { title: "SVV'04 - Privacyverklaring" }

export default function PrivacyPage() {
  const content = readFileSync(join(process.cwd(), 'src/content/privacy.md'), 'utf-8')

  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Privacyverklaring' }]} />

      <div className="page-inner">
        <h1 className="page-title">Privacyverklaring</h1>
        <div className="static-page-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </main>
  )
}
