import React from 'react'
import type { Media } from '@/payload-types'

type Props = {
  eyebrow?: string | null
  title?: string | null
  text?: string | null
  image?: Media | number | string | null
  buttonLabel?: string | null
  url?: string | null
}

export default function FeatureCardBlockComponent({
  eyebrow,
  title,
  text,
  image,
  buttonLabel,
  url,
}: Props) {
  const photo = image && typeof image === 'object' ? image : null
  const external = Boolean(url && /^https?:\/\//.test(url))

  return (
    <section className="feature-card">
      {photo?.url && (
        <div className="feature-card__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.sizes?.teamPhoto?.url ?? photo.url} alt={photo.alt ?? ''} />
        </div>
      )}
      <div className="feature-card__body">
        {eyebrow && <span className="feature-card__eyebrow">{eyebrow}</span>}
        {title && <h2 className="feature-card__title">{title}</h2>}
        {text && <p className="feature-card__text">{text}</p>}
        {url && buttonLabel && (
          <a
            className="feature-card__button"
            href={url}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {buttonLabel} <span aria-hidden="true">&rarr;</span>
          </a>
        )}
      </div>
    </section>
  )
}
