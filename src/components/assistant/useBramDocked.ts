'use client'

import { useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'

// Bram moves from the button at the bottom right into the "Stel je vraag" band once the top of
// the band is this far up the screen, and stays there while you scroll on past the band. Only
// when you scroll back above it does he go back to the button.
const DOCK_LINE = 0.7

/** Calls `onChange` at most once per frame while the page scrolls or resizes. */
function subscribe(onChange: () => void) {
  let frame = 0
  const schedule = () => {
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0
        onChange()
      })
    }
  }
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  return () => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    cancelAnimationFrame(frame)
  }
}

function isDocked() {
  const bar = document.querySelector('.assistant-bar')
  return bar ? bar.getBoundingClientRect().top < window.innerHeight * DOCK_LINE : false
}

/**
 * Whether Bram sits in the "Stel je vraag" band (true) or in the button (false). The button and
 * the band both read this, so they always agree. False on pages without the band, and during
 * the server render.
 */
export function useBramDocked(): boolean {
  // A new page renders again, so the position is read for that page's band.
  usePathname()
  return useSyncExternalStore(subscribe, isDocked, () => false)
}
