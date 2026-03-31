import React from 'react'
import Link from 'next/link'
import { readFileSync } from 'fs'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'

export const metadata = { title: "Cookiebeleid — SVV'04 Schoonebeek" }

export default function CookiesPage() {
  const content = readFileSync(join(process.cwd(), 'src/content/cookies.md'), 'utf-8')

  return (
    <main className="static-page">
      <nav className="team-breadcrumb" aria-label="Kruimelpad">
        <div className="team-page-inner">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Cookiebeleid</span>
        </div>
      </nav>

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
