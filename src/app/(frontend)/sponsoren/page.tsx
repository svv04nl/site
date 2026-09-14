import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SponsorsOverview } from '@/components/SponsorsOverview'

export const metadata = { title: "SVV'04 - Sponsoren" }

export default async function SponsorenPage() {
  const payload = await getPayload({ config })

  const { docs: sponsors } = await payload.find({
    collection: 'sponsors',
    sort: 'name',
    limit: 100,
    depth: 1,
  })

  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Sponsoren' }]} />

      <div className="page-inner">
        <SectionHeader as="h1" title="Sponsoren" />

        <SponsorsOverview sponsors={sponsors} />
      </div>
    </main>
  )
}
