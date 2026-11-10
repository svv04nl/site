'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAssistant } from '@/components/assistant/AssistantProvider'
import { BramAvatar } from '@/components/assistant/BramAvatar'

/**
 * Round "Vraag het Bram" button at the bottom right that opens the assistant popup.
 * It steps aside while a "Stel je vraag" band is in view (that band does the same job),
 * while the popup is open and on the full assistant page. The small cross hides Bram for the
 * rest of the visit (sessionStorage); on a next visit he is back.
 */

const HIDDEN_KEY = 'svv-bram-verborgen'

export function AssistantFab() {
  const { enabled, open, openAssistant } = useAssistant()
  const pathname = usePathname()
  const [barInView, setBarInView] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(HIDDEN_KEY)) setHidden(true)
    } catch {
      // No storage (private mode): Bram just stays.
    }
  }, [])

  const hide = () => {
    setHidden(true)
    try {
      sessionStorage.setItem(HIDDEN_KEY, '1')
    } catch {
      // Hidden for this page only.
    }
  }

  useEffect(() => {
    setBarInView(false)
    const bars = document.querySelectorAll('.assistant-bar')
    if (!bars.length || !('IntersectionObserver' in window)) return
    const visible = new Set<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target)
          else visible.delete(entry.target)
        }
        setBarInView(visible.size > 0)
      },
      { threshold: 0.35 },
    )
    bars.forEach((bar) => observer.observe(bar))
    return () => observer.disconnect()
  }, [pathname])

  if (!enabled || hidden || pathname?.startsWith('/assistent')) return null

  const away = open || barInView

  return (
    <div className={`assistant-fab-dock${away ? ' is-away' : ''}`}>
      <button
        type="button"
        className="assistant-fab"
        onClick={() => openAssistant()}
        aria-label="Vraag het Bram"
        tabIndex={away ? -1 : 0}
      >
        <BramAvatar size={62} />
        <span className="assistant-fab__label">Vraag het Bram</span>
      </button>
      <button
        type="button"
        className="assistant-fab__close"
        onClick={hide}
        aria-label="Verberg Bram"
        title="Verberg Bram"
        tabIndex={away ? -1 : 0}
      >
        <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
          <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
