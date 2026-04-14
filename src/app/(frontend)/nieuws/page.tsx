import { getPayload } from 'payload'
import config from '@/payload.config'
import React from 'react'
import Link from 'next/link'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import type { Post } from '@/payload-types'
import { NewsCard } from '@/components/ui/NewsCard'
import { SectionHeader } from '@/components/ui/SectionHeader'

export const metadata = { title: "SVV'04 - Nieuws" }

const PAGE_SIZE = 12

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function NewsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

  const payload = await getPayload({ config: await config })

  const { docs: posts, totalDocs } = await payload.find({
    collection: 'posts',
    where: {
      and: [{ status: { equals: 'published' } }],
    },
    sort: '-publishedAt',
    limit: PAGE_SIZE,
    page: currentPage,
    depth: 1,
  })

  const totalPages = Math.ceil(totalDocs / PAGE_SIZE)

  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Nieuws' }]} />

      <div className="page-inner">
        <SectionHeader as="h1" title="Nieuws" />

        {posts.length === 0 ? (
          <p className="news-empty">Nog geen nieuwsberichten.</p>
        ) : (
          <div className="news-grid">
            {posts.map((post) => (
              <NewsCard key={post.id} post={post as Post} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="news-pagination" aria-label="Paginering">
            {currentPage > 1 ? (
              <Link className="news-pagination-btn" href={`/nieuws?page=${currentPage - 1}`}>
                ← Vorige
              </Link>
            ) : (
              <span className="news-pagination-btn news-pagination-btn--disabled">← Vorige</span>
            )}
            <span className="news-pagination-info">
              Pagina {currentPage} van {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link className="news-pagination-btn" href={`/nieuws?page=${currentPage + 1}`}>
                Volgende →
              </Link>
            ) : (
              <span className="news-pagination-btn news-pagination-btn--disabled">Volgende →</span>
            )}
          </nav>
        )}
      </div>
    </main>
  )
}
