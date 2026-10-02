import Link from 'next/link'
import type { Media, Post } from '@/payload-types'
import { MoreLink } from './MoreLink'

type Props = {
  post: Post
}

/**
 * Horizontale nieuwskaart voor de homepage-stapel: afbeelding links,
 * meta + titel + excerpt + "Lees meer" rechts.
 */
export function NewsRowCard({ post }: Props) {
  const image = post.featuredImage as Media | null | undefined
  const imageUrl = image?.sizes?.newsCard?.url ?? image?.url ?? null
  const isContain = (post as any).imageFit === 'contain'
  const bgColor = (post as any).imageBackground || '#ffffff'

  return (
    <Link href={`/nieuws/${post.slug}`} className="news-row">
      <div
        className={`news-row-img-wrap${imageUrl ? '' : ' news-row-img-wrap--placeholder'}`}
        style={isContain ? { backgroundColor: bgColor } : undefined}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={image?.alt ?? post.title}
            className="news-row-img"
            style={isContain ? { objectFit: 'contain', padding: '0.75rem' } : undefined}
          />
        ) : (
          <img src="/logo.webp" alt="" className="news-row-img-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="news-row-body">
        <div className="news-row-meta">
          <time className="news-row-date">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : ''}
          </time>
        </div>
        <h3 className="news-row-title">{post.title}</h3>
        {post.excerpt && <p className="news-row-excerpt">{post.excerpt}</p>}
        <MoreLink text="Lees meer" />
      </div>
    </Link>
  )
}
