import React from 'react'
import Link from 'next/link'
import { readFileSync } from 'fs'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'

export const metadata = { title: "SVV'04 - Privacyverklaring" }

export default function PrivacyPage() {
  const content = readFileSync(join(process.cwd(), 'src/content/privacy.md'), 'utf-8')

  return (
    <main className="static-page">
      <nav className="team-breadcrumb" aria-label="Kruimelpad">
        <div className="team-page-inner">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Privacyverklaring</span>
        </div>
      </nav>

      <div className="static-page-inner">
        <h1 className="programma-title">Privacyverklaring</h1>
        <div className="static-page-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </main>
  )
}
