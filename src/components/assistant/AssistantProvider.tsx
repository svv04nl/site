'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

// The chat (AI SDK, markdown) only loads when a visitor first opens the assistant.
const AssistantPanel = dynamic(() => import('./AssistantPanel'), { ssr: false })

type AssistantContextValue = {
  /** False when the assistant is switched off; the site search is shown instead. */
  enabled: boolean
  open: boolean
  /** Opens the panel; with a question it is sent straight away. */
  openAssistant: (question?: string) => void
  closeAssistant: () => void
}

const AssistantContext = createContext<AssistantContextValue>({
  enabled: false,
  open: false,
  openAssistant: () => {},
  closeAssistant: () => {},
})

export const useAssistant = () => useContext(AssistantContext)

export function AssistantProvider({
  enabled,
  children,
}: {
  enabled: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  // Once opened the panel stays mounted (hidden), so a running answer and the conversation survive closing.
  const [mounted, setMounted] = useState(false)
  const [question, setQuestion] = useState<string | null>(null)
  const pathname = usePathname()

  const openAssistant = useCallback((text?: string) => {
    setMounted(true)
    setOpen(true)
    if (text?.trim()) setQuestion(text.trim())
  }, [])

  const closeAssistant = useCallback(() => setOpen(false), [])

  // A modal must not stay open over a new page (e.g. after following a link in an answer).
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Cmd/Ctrl+K opens the assistant from anywhere.
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        openAssistant()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, openAssistant])

  const value = useMemo(
    () => ({ enabled, open, openAssistant, closeAssistant }),
    [enabled, open, openAssistant, closeAssistant],
  )

  return (
    <AssistantContext.Provider value={value}>
      {children}
      {enabled && mounted && (
        <AssistantPanel
          open={open}
          onClose={closeAssistant}
          question={question}
          onQuestionSent={() => setQuestion(null)}
        />
      )}
    </AssistantContext.Provider>
  )
}
