'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAssistant } from '@/components/assistant/AssistantProvider'
import { BramAvatar } from '@/components/assistant/BramAvatar'

/**
 * Round "Vraag het Bram" button at the bottom right that opens the assistant popup.
 * It steps aside while a "Stel je vraag" band is in view (that band does the same job),
 * while the popup is open and on the full assistant page.
 */
export function AssistantFab() {
  const { enabled, open, openAssistant } = useAssistant()
  const pathname = usePathname()
  const [barInView, setBarInView] = useState(false)

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

  if (!enabled || pathname?.startsWith('/assistent')) return null

  const away = open || barInView

  return (
    <button
      type="button"
      className={`assistant-fab${away ? ' is-away' : ''}`}
      onClick={() => openAssistant()}
      aria-label="Vraag het Bram"
      tabIndex={away ? -1 : 0}
    >
      <BramAvatar size={62} />
      <span className="assistant-fab__label">Vraag het Bram</span>
    </button>
  )
}
