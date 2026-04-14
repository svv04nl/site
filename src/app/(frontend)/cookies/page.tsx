import React from 'react'
import Link from 'next/link'
import { readFileSync } from 'fs'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionTitle } from '@payloadcms/ui'
import { SectionHeader } from '@/components/ui/SectionHeader'

export const metadata = { title: "SVV'04 - Cookiebeleid" }

export default function CookiesPage() {
  const content = readFileSync(join(process.cwd(), 'src/content/cookies.md'), 'utf-8')

  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Cookiebeleid' }]} />

      <div className="page-inner">
        <SectionHeader as="h1" title="Cookiebeleid" subtitle="Laatst bijgewerkt: januari 2025" />
        <div className="static-page-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </main>
  )
}
