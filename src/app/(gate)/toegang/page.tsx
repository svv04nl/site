import React from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAccessCode, safeRedirectTarget } from '@/lib/access-gate'
import AccessForm from './AccessForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: "SVV'04 Schoonebeek",
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ next?: string }> }

export default async function AccessPage({ searchParams }: Props) {
  // Staat de poort uit, dan is er geen reden om hier te zijn.
  if (!getAccessCode()) {
    redirect('/')
  }
  const { next } = await searchParams

  return (
    <main className="gate">
      <div className="gate-card">
        <img src="/logo.webp" alt="SVV'04 Schoonebeek" width={278} height={336} />
        <h1>Toegang met code</h1>
        <p>Deze website is nog niet openbaar. Vul de toegangscode in om verder te gaan.</p>
        <AccessForm next={safeRedirectTarget(next)} />
      </div>
    </main>
  )
}
