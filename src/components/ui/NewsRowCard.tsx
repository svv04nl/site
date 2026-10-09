import Link from 'next/link'
import type { Media, Post } from '@/payload-types'

type Props = {
  post: Post
}

/**
 * Nieuwsitem voor de homepage-lijst: afbeelding links (3:2), datum, titel,
 * excerpt en "Lees meer" rechts.
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
        {post.publishedAt && (
          <time className="news-row-date" dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        )}
        <h3 className="news-row-title">{post.title}</h3>
        {post.excerpt && <p className="news-row-excerpt">{post.excerpt}</p>}
        <span className="news-row-more">Lees meer &rarr;</span>
      </div>
    </Link>
  )
}
