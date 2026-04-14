import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { defaultJSXConverters } from '@/lib/richtext'
import { MoreLink } from '@/components/ui/MoreLink'
import type { Media, Team } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

const CATEGORY_LABELS: Record<string, string> = {
  club: 'Club',
  senioren: 'Senioren',
  junioren: 'Junioren',
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  const post = docs[0]
  if (!post) return {}
  return { title: `SVV'04 - ${post.title}` }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  const [{ docs }, { docs: sidebarPosts }] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      depth: 2,
    }),
    payload.find({
      collection: 'posts',
      where: {
        and: [{ status: { equals: 'published' } }, { slug: { not_equals: slug } }],
      },
      sort: '-publishedAt',
      limit: 4,
      depth: 1,
    }),
  ])

  if (!docs[0]) notFound()

  const post = docs[0]
  const image = post.featuredImage as Media | null | undefined
  const isContain = (post as any).imageFit === 'contain'
  const bgColor = (post as any).imageBackground || '#ffffff'
  const imageUrl = image?.url ?? null

  const categories = (post as any).categories as string[] | null | undefined
  const relatedTeams = (post as any).relatedTeams as Array<Team | string> | null | undefined
  const teamNames =
    relatedTeams?.filter((t): t is Team => typeof t === 'object').map((t) => t.name) ?? []
  const allTags = [...(categories?.map((c) => CATEGORY_LABELS[c] ?? c) ?? []), ...teamNames]

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <main className="page news-detail">
      <SetBreadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Nieuws', href: '/nieuws' },
          { label: post.title },
        ]}
      />

      <div className="section-with-sidebar">
        {/* Main article */}
        <article className="sidebar-content-col sidebar-content-col--no-gap news-detail-main">
          {imageUrl && (
            <div
              className="news-detail-hero"
              style={isContain ? { backgroundColor: bgColor } : undefined}
            >
              <img
                src={imageUrl}
                alt={image?.alt ?? post.title}
                className="news-detail-hero-img"
                style={isContain ? { objectFit: 'contain' } : undefined}
              />
            </div>
          )}

          <div className="news-detail-inner">
            <div className="card-news-meta">
              {formattedDate && <time className="card-news-date">{formattedDate}</time>}
              {allTags.length > 0 && (
                <div className="card-news-tags">
                  {allTags.map((tag) => (
                    <span key={tag} className="card-news-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h1 className="news-detail-title">{post.title}</h1>

            {post.content && (
              <div className="news-detail-body">
                <RichText data={post.content} converters={defaultJSXConverters} />
              </div>
            )}

            <div className="news-detail-footer">
              <Link href="/nieuws" className="news-detail-back">
                ← Terug naar nieuwsoverzicht
              </Link>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <div className="sidebar-col">
          <div className="sidebar-col__inner">
          <div className="sidebar-section">
            <h2 className="sidebar-section-title">Laatste Nieuws</h2>
            <ul className="news-sidebar-list">
              {sidebarPosts.map((p) => {
                const pCats = (p as any).categories as string[] | null | undefined
                const pTeams = (p as any).relatedTeams as Array<Team | string> | null | undefined
                const pTeamNames =
                  pTeams?.filter((t): t is Team => typeof t === 'object').map((t) => t.name) ?? []
                const pTags = [...(pCats?.map((c) => CATEGORY_LABELS[c] ?? c) ?? []), ...pTeamNames]
                return (
                  <li key={p.id}>
                    <Link href={`/nieuws/${p.slug}`} className="news-sidebar-item">
                      <div className="news-sidebar-item-meta">
                        {p.publishedAt && (
                          <time className="news-secondary-date">
                            {new Date(p.publishedAt).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </time>
                        )}
                        {pTags.length > 0 && (
                          <div className="card-news-tags">
                            {pTags.map((tag) => (
                              <span key={tag} className="card-news-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <h3 className="news-sidebar-item-title">{p.title}</h3>
                      {p.excerpt && <p className="news-sidebar-item-excerpt">{p.excerpt}</p>}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <MoreLink href="/nieuws" text="Meer nieuws" />
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}
