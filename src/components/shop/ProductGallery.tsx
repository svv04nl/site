'use client'

import React, { useState } from 'react'
import type { ProductImage } from '@/lib/products'

/**
 * The product's photos: one large with thumbnails under it. A single photo is shown whole, at its
 * own size, without thumbnails.
 */
export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="product-gallery__empty" aria-hidden="true" />
  }

  if (images.length === 1) {
    const [image] = images
    return (
      <div className="product-gallery product-gallery--single">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.alt}
          width={image.width ?? undefined}
          height={image.height ?? undefined}
        />
      </div>
    )
  }

  const current = images[Math.min(active, images.length - 1)]
  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt} />
      </div>
      <ul className="product-gallery__thumbs">
        {images.map((image, i) => (
          <li key={image.url}>
            <button
              type="button"
              className={`product-gallery__thumb${i === active ? ' is-active' : ''}`}
              aria-label={`Foto ${i + 1} van ${images.length} van ${name}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.cardUrl} alt="" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
