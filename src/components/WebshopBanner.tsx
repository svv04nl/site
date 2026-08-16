'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

const IMAGES = [
  '/webshop/webshop-banner-1.webp',
  '/webshop/webshop-banner-2.webp',
  '/webshop/webshop-banner-3.webp',
  '/webshop/webshop-banner-4.webp',
  '/webshop/webshop-banner-5.webp',
]

const INTERVAL_MS = 4500

/**
 * Square webshop banner that cross-fades through the Stanno product photos,
 * with a fixed overlay button linking to the club webshop.
 */
export function WebshopBanner() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % IMAGES.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="webshop-banner">
      <div className="webshop-banner-stage" aria-hidden="true">
        {IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`webshop-banner-slide${i === active ? ' is-active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      <Link className="webshop-banner-button" href="/vereniging/clubkleding">
        Kleding kopen &rarr;
      </Link>
    </div>
  )
}
