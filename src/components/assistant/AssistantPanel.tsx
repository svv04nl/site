'use client'

import React, { useEffect } from 'react'
import AssistantChat from '@/components/assistant/AssistantChat'
import { SparkleIcon } from '@/components/assistant/icons'

type Props = {
  open: boolean
  onClose: () => void
  /** A question to send as soon as the chat is ready (from the homepage bar or an example). */
  question: string | null
  onQuestionSent: () => void
}

/** The assistant as a panel at the bottom right (a full-screen sheet on mobile). */
export default function AssistantPanel({ open, onClose, question, onQuestionSent }: Props) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Keep the page behind the full-screen sheet from scrolling.
  useEffect(() => {
    if (!open) return
    document.documentElement.classList.add('assistant-panel-open')
    return () => document.documentElement.classList.remove('assistant-panel-open')
  }, [open])

  return (
    <>
      <div className="assistant-panel-backdrop" hidden={!open} onClick={onClose} />
      <section
        className="assistant-panel"
        role="dialog"
        aria-label="Vraag het de assistent"
        hidden={!open}
      >
        <header className="assistant-panel__header">
          <SparkleIcon size={18} />
          <h2>Vraag het de assistent</h2>
          <button
            type="button"
            className="assistant-panel__close"
            aria-label="Sluiten"
            onClick={onClose}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <AssistantChat
          variant="panel"
          active={open}
          question={question}
          onQuestionSent={onQuestionSent}
          onNavigate={onClose}
        />
      </section>
    </>
  )
}
