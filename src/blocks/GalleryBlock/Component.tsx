'use client'

import React, { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { Media } from '@/payload-types'

type GalleryImage = {
  image?: Media | number | null
  caption?: string | null
}

type Props = {
  images?: GalleryImage[] | null
}

// Grid of thumbnails; a click opens all images in a lightbox. Thumbnails use a
// size that keeps the original aspect ratio (teamPhoto, 900px wide).
export default function GalleryBlockComponent({ images }: Props) {
  const [index, setIndex] = useState<number | null>(null)

  const items = (images ?? []).flatMap(({ image, caption }) =>
    image && typeof image === 'object' && image.url
      ? [
          {
            src: image.url,
            thumb: image.sizes?.teamPhoto?.url ?? image.url,
            alt: image.alt ?? caption ?? '',
            caption,
            width: image.width ?? undefined,
            height: image.height ?? undefined,
          },
        ]
      : [],
  )
  if (items.length === 0) return null

  return (
    <>
      <div className="gallery-block">
        {items.map((item, i) => (
          <figure key={item.src} className="gallery-block__item">
            <button
              type="button"
              className="gallery-block__button"
              onClick={() => setIndex(i)}
              aria-label={`Vergroot: ${item.alt || `afbeelding ${i + 1}`}`}
            >
              <img
                src={item.thumb}
                alt={item.alt}
                width={item.width}
                height={item.height}
                loading="lazy"
                className="gallery-block__img"
              />
            </button>
            {item.caption && (
              <figcaption className="gallery-block__caption">{item.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
      <Lightbox
        open={index !== null}
        index={index ?? 0}
        close={() => setIndex(null)}
        slides={items.map((item) => ({ src: item.src, alt: item.alt }))}
        carousel={{ finite: true, imageFit: 'contain', padding: '0px' }}
        animation={{ fade: 200, swipe: 200 }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  )
}
