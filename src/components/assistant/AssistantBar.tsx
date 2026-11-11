'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { EXAMPLES } from '@/components/assistant/AssistantChat'
import { useAssistant, type AssistantAudience } from '@/components/assistant/AssistantProvider'
import { SparkleIcon } from '@/components/assistant/icons'
import { BramAvatar } from '@/components/assistant/BramAvatar'
import { useBramDocked } from '@/components/assistant/useBramDocked'
import { MAX_USER_MESSAGE_CHARS } from '@/lib/ai/limits'

const CHIPS = EXAMPLES.slice(0, 4)

/**
 * On a "Voor jou" page: makes the assistant answer from the visitor's perspective (parent,
 * player, ...) and use that page's example questions, wherever the assistant is opened on the
 * page. Renders nothing, so it also works on a page without the "Stel je vraag" band.
 */
export function AssistantAudienceContext({ audience }: { audience: AssistantAudience }) {
  const { setAudience } = useAssistant()
  const { slug } = audience
  const questionsKey = audience.questions.join('\n')
  useEffect(() => {
    setAudience({ slug, questions: questionsKey ? questionsKey.split('\n') : [] })
    return () => setAudience(null)
  }, [slug, questionsKey, setAudience])
  return null
}

/**
 * "Stel je vraag" band: a question typed here opens the assistant popup. On a "Voor jou" page
 * `audience` supplies the example questions under the field.
 */
export function AssistantBar({
  audience,
  intro,
}: {
  audience?: AssistantAudience
  /** Replaces the default line under the heading, e.g. a line that fits the audience. */
  intro?: string | null
}) {
  const { enabled, openAssistant } = useAssistant()
  const [input, setInput] = useState('')
  // Bram lands in the big circle when the band comes into view (the button at the bottom right
  // flies here) and stays while you scroll on past it.
  const docked = useBramDocked(usePathname())

  const chips = audience?.questions.length ? audience.questions.slice(0, 4) : CHIPS

  if (!enabled) {
    return null
  }

  const ask = (text: string) => {
    if (!text.trim()) {
      return
    }
    openAssistant(text)
    setInput('')
  }

  return (
    <section
      className={`assistant-bar${docked ? ' has-bram' : ''}`}
      aria-labelledby="assistant-bar-title"
    >
      <div className="assistant-bar__inner">
        <div className="assistant-bar__bram" data-bram-spot>
          <span className="assistant-bar__bubble" aria-hidden="true">
            Hoi! Ik ben Bram. Vraag maar raak.
          </span>
          <button
            type="button"
            className="assistant-bar__bram-button"
            onClick={() => openAssistant()}
            aria-label="Vraag het Bram"
            tabIndex={docked ? 0 : -1}
          >
            <BramAvatar size={200} tone="red" />
          </button>
        </div>
        <p className="home-eyebrow">Direct antwoord</p>
        <h2 className="home-h2" id="assistant-bar-title">
          Stel je <span>vraag</span>
        </h2>
        <p className="assistant-bar__intro">
          {intro ||
            'Over het programma, de uitslagen, het lidmaatschap of vrijwilligerswerk: je krijgt meteen antwoord.'}
        </p>
        <form
          className="assistant-bar__form"
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
        >
          <SparkleIcon size={20} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Wat wil je weten over SVV'04?"
            maxLength={MAX_USER_MESSAGE_CHARS}
            aria-label="Je vraag"
            autoComplete="off"
          />
          <button type="submit" className="btn btn--primary" disabled={!input.trim()}>
            Vraag
          </button>
        </form>
        <ul className="assistant-bar__chips">
          {chips.map((chip) => (
            <li key={chip}>
              <button type="button" onClick={() => ask(chip)}>
                {chip}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
