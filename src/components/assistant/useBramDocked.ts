'use client'

import { useEffect, useState } from 'react'

// Bram moves from the button at the bottom right into the "Stel je vraag" band once the top of
// the band is this far up the screen, and stays there while you scroll on past the band. Only
// when you scroll back above it does he go back to the button.
const DOCK_LINE = 0.7

/**
 * Whether Bram sits in the "Stel je vraag" band (true) or in the button (false). The button and
 * the band both read this, so they always agree. False on pages without the band.
 */
export function useBramDocked(pathname: string | null): boolean {
  const [docked, setDocked] = useState(false)

  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const bar = document.querySelector('.assistant-bar')
      setDocked(bar ? bar.getBoundingClientRect().top < window.innerHeight * DOCK_LINE : false)
    }
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(check)
      }
    }
    check()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [pathname])

  return docked
}
