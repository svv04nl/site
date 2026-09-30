'use client'

import React, { useEffect, useState } from 'react'

// Matches $breakpoint-nav: the desktop navigation, i.e. "desktop" for the hero.
const DESKTOP_QUERY = '(min-width: 1031px) and (prefers-reduced-motion: no-preference)'

/**
 * Looping background video for the homepage hero. Only mounted on desktop
 * (and not for reduced-motion / data-saver visitors), so phones and tablets
 * never download the file. Until then the static hero image stays visible.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData
    const update = () => setEnabled(mq.matches && !saveData)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (!enabled) return null

  return (
    <video
      className="site-hero-video"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  )
}
