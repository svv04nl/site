'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAssistant } from '@/components/assistant/AssistantProvider'
import { BramAvatar } from '@/components/assistant/BramAvatar'
import { useBramDocked } from '@/components/assistant/useBramDocked'
import { useClientValue } from '@/lib/use-client-value'

/**
 * Round "Vraag het Bram" button at the bottom right that opens the assistant popup.
 * When the "Stel je vraag" band comes into view, Bram flies from the button into the big circle
 * in that band and stays there while you scroll on; above the band he flies back. The button
 * also steps aside while the popup is open and on the full assistant page. The small cross
 * hides Bram for the rest of the visit (sessionStorage); on a next visit he is back.
 */

const HIDDEN_KEY = 'svv-bram-verborgen'
const FLIGHT_MS = 450

/**
 * A copy of Bram flying from one circle to the other: a fixed element moved and scaled with the
 * Web Animations API, removed when it lands. Skipped when the visitor prefers less motion.
 */
function fly(avatar: Element, a: DOMRect, b: DOMRect, toRed: boolean) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !a.width || !b.width) {
    return
  }
  const ghost = avatar.cloneNode(true) as HTMLElement
  ghost.classList.add('bram-flight')
  ghost.classList.toggle('bram-avatar--red', !toRed)
  ghost.style.left = `${a.left}px`
  ghost.style.top = `${a.top}px`
  ghost.style.setProperty('--bram-size', `${a.width}px`)
  document.body.appendChild(ghost)
  // The circle turns red (or white) on the way.
  requestAnimationFrame(() => ghost.classList.toggle('bram-avatar--red', toRed))
  const scale = b.width / a.width
  ghost
    .animate(
      [
        { transform: 'translate(0, 0) scale(1)' },
        { transform: `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${scale})` },
      ],
      { duration: FLIGHT_MS, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1.05)', fill: 'forwards' },
    )
    .finished.finally(() => ghost.remove())
}

function readHidden() {
  try {
    return Boolean(sessionStorage.getItem(HIDDEN_KEY))
  } catch {
    // No storage (private mode): Bram just stays.
    return false
  }
}

export function AssistantFab() {
  const { enabled, open, openAssistant } = useAssistant()
  const pathname = usePathname()
  const docked = useBramDocked()
  // Closed earlier in this visit (kept in sessionStorage), or just now.
  const hiddenBefore = useClientValue(readHidden, false)
  const [closed, setClosed] = useState(false)
  const hidden = hiddenBefore || closed
  const dockRef = useRef<HTMLDivElement>(null)
  const wasDocked = useRef<boolean | null>(null)

  // Fly between the button and the band when the docked state changes (not on the first
  // render: a page opened below the band just shows Bram in it).
  useEffect(() => {
    const before = wasDocked.current
    wasDocked.current = docked
    if (before === null || before === docked || hidden || open) {
      return
    }
    // Measured on elements without a running transform: the button's avatar (the button only
    // fades while Bram is in the band) and the box around the circle in the band.
    const fab = dockRef.current?.querySelector('.bram-avatar')
    const spot = document.querySelector('[data-bram-spot]')
    const spotAvatar = spot?.querySelector('.bram-avatar')
    if (fab && spot && spotAvatar) {
      const fabRect = fab.getBoundingClientRect()
      const spotRect = spot.getBoundingClientRect()
      if (docked) {
        fly(fab, fabRect, spotRect, true)
      } else {
        fly(spotAvatar, spotRect, fabRect, false)
      }
    }
  }, [docked, hidden, open])

  const hide = () => {
    setClosed(true)
    try {
      sessionStorage.setItem(HIDDEN_KEY, '1')
    } catch {
      // Hidden for this page only.
    }
  }

  if (!enabled || hidden || pathname?.startsWith('/assistent')) {
    return null
  }

  const away = open || docked

  return (
    <div
      ref={dockRef}
      className={`assistant-fab-dock${away ? ' is-away' : ''}${docked ? ' is-docked' : ''}`}
    >
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
