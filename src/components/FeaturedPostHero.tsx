import Link from 'next/link'
import type { Media, Post } from '@/payload-types'

// Grass background for featured posts that have no hero image of their own.
const DEFAULT_BACKDROP = '/images/hero-gras.webp'

// Homepage hero for a featured news post (Posts.heroFeatured). Left-aligned
// text over the post's hero image; replaces the default welcome hero while the
// post's date range is active. The article's own image (featuredImage) is not
// used here, and the fallback backdrop only ever appears in this hero.
export function FeaturedPostHero({ post }: { post: Post }) {
  const image = post.heroImage as Media | null | undefined
  const imageUrl = image ? (image.sizes?.hero?.url ?? image.url ?? null) : null
  const focalX = image?.focalX ?? 50
  const focalY = image?.focalY ?? 50
  // Optional separate background for narrow screens (e.g. only grass), used behind the copy.
  const mobileImage = post.heroImageMobile as Media | null | undefined
  const mobileUrl = mobileImage?.url ?? null

  // Text sits directly on a plain backdrop (instead of a photo strip below it) when
  // there is a mobile image or no hero image at all.
  const backdropOnly = Boolean(mobileUrl) || !imageUrl

  return (
    <section
      className={`site-hero site-hero--post${backdropOnly ? ' site-hero--post-backdrop' : ''}`}
    >
      <div className="site-hero-image" aria-hidden="true">
        <picture>
          {/* Matches $breakpoint-nav */}
          {mobileUrl && <source media="(max-width: 1030px)" srcSet={mobileUrl} />}
          <img
            src={imageUrl ?? DEFAULT_BACKDROP}
            alt=""
            className="site-hero-photo"
            fetchPriority="high"
            style={{ objectPosition: `${focalX}% ${focalY}%` }}
          />
        </picture>
        <div className="site-hero-overlay site-hero-overlay--side" />
      </div>
      <div className="site-hero-inner">
        <div className="site-hero-content">
          <p className="site-hero-eyebrow">
            Nieuws
            {post.publishedAt && (
              <time dateTime={post.publishedAt} className="site-hero-date">
                {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            )}
          </p>
          <h1 className="site-hero-title">{post.title}</h1>
          {post.excerpt && <p className="site-hero-tagline">{post.excerpt}</p>}
          <div className="site-hero-actions">
            <Link className="btn btn--primary btn--lg" href={`/nieuws/${post.slug}`}>
              Lees het bericht &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
