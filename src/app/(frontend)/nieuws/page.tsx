import { getPayload } from 'payload'
import config from '@/payload.config'
import React from 'react'
import Link from 'next/link'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import type { Media } from '@/payload-types'

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
      and: [
        { status: { equals: 'published' } },
        { category: { equals: 'nieuws' } },
      ],
    },
    sort: '-publishedAt',
    limit: PAGE_SIZE,
    page: currentPage,
    depth: 1,
  })

  const totalPages = Math.ceil(totalDocs / PAGE_SIZE)

  return (
    <main className="nieuws-page">

      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Nieuws' }]} />

      <div className="team-page-inner">
        <h1 className="programma-title">Nieuws</h1>

        {posts.length === 0 ? (
          <p className="news-empty">Nog geen nieuwsberichten.</p>
        ) : (
          <div className="news-grid">
            {posts.map((post) => {
              const image = post.featuredImage as Media | null | undefined
              const imageUrl = image?.sizes?.newsCard?.url ?? image?.url ?? null
              return (
                <article key={post.id} className="news-card">
                  <div className={`news-card-img-wrap${imageUrl ? '' : ' news-card-img-wrap--placeholder'}`}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={image?.alt ?? post.title} className="news-card-img" />
                    ) : (
                      <img src="/logo.png" alt="" className="news-card-img-placeholder" aria-hidden="true" />
                    )}
                  </div>
                  <div className="news-card-body">
                    <time className="news-card-date">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''}
                    </time>
                    <h3 className="news-card-title">
                      <Link href={`/nieuws/${post.slug}`}>{post.title}</Link>
                    </h3>
                    {post.excerpt && (
                      <p className="news-card-excerpt">{post.excerpt}</p>
                    )}
                  </div>
                </article>
              )
            })}
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

