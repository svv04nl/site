import React from 'react'
import Link from 'next/link'
import { readFileSync } from 'fs'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'

export const metadata = { title: "SVV'04 - Cookiebeleid" }

export default function CookiesPage() {
  const content = readFileSync(join(process.cwd(), 'src/content/cookies.md'), 'utf-8')

  return (
    <main className="static-page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Cookiebeleid' }]} />

      <div className="static-page-inner">
        <h1 className="programma-title">Cookiebeleid</h1>
        <p className="static-page-date">Laatst bijgewerkt: januari 2025</p>
        <div className="static-page-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </main>
  )
}
