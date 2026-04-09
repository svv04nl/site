import Link from 'next/link'
import type { Media, Post, Team } from '@/payload-types'
import { MoreLink } from './MoreLink'

const CATEGORY_LABELS: Record<string, string> = {
  club: 'Club',
  senioren: 'Senioren',
  junioren: 'Junioren',
}

function categoryLabel(categories: string[] | null | undefined): string {
  const first = categories?.[0]
  return first ? (CATEGORY_LABELS[first] ?? first) : 'Club'
}

type Props = {
  post: Post
}

export function NewsCard({ post }: Props) {
  const image = post.featuredImage as Media | null | undefined
  const imageUrl = image?.sizes?.newsCard?.url ?? image?.url ?? null
  const isContain = (post as any).imageFit === 'contain'
  const bgColor = (post as any).imageBackground || '#ffffff'
  const categories = (post as any).categories as string[] | null | undefined
  const relatedTeams = (post as any).relatedTeams as Array<Team | string> | null | undefined
  const teamNames = relatedTeams
    ?.filter((t): t is Team => typeof t === 'object')
    .map((t) => t.name) ?? []

  const allTags = [categoryLabel(categories), ...teamNames]

  return (
    <Link href={`/nieuws/${post.slug}`} className="card-news card">
      <div
        className={`news-card-img-wrap${imageUrl ? '' : ' news-card-img-wrap--placeholder'}`}
        style={isContain ? { backgroundColor: bgColor } : undefined}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={image?.alt ?? post.title}
            className="news-card-img"
            style={isContain ? { objectFit: 'contain', padding: '0.75rem' } : undefined}
          />
        ) : (
          <img src="/logo.png" alt="" className="news-card-img-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="news-card-body">
        <div className="news-card-meta">
          <time className="news-card-date">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : ''}
          </time>
          <div className="news-card-tags">
            {allTags.map((tag) => (
              <span key={tag} className="news-card-tag">{tag}</span>
            ))}
          </div>
        </div>
        <h3 className="news-card-title">{post.title}</h3>
        {post.excerpt && <p className="news-card-excerpt">{post.excerpt}</p>}
        <MoreLink text="Lees meer" />
      </div>
    </Link>
  )
}
