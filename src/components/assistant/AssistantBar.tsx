'use client'

import React, { useEffect, useState } from 'react'
import { EXAMPLES } from '@/components/assistant/AssistantChat'
import { useAssistant, type AssistantAudience } from '@/components/assistant/AssistantProvider'
import { SparkleIcon } from '@/components/assistant/icons'
import { MAX_USER_MESSAGE_CHARS } from '@/lib/ai/limits'

const CHIPS = EXAMPLES.slice(0, 4)

/**
 * "Stel je vraag" band: a question typed here opens the assistant popup. On a "Voor jou" page
 * `audience` makes the assistant answer from the visitor's perspective (parent, player, ...),
 * also when it is opened from elsewhere on that page, and supplies the example questions.
 */
export function AssistantBar({ audience }: { audience?: AssistantAudience }) {
  const { enabled, openAssistant, setAudience } = useAssistant()
  const [input, setInput] = useState('')

  const slug = audience?.slug
  const questionsKey = audience?.questions.join('\n') ?? ''
  useEffect(() => {
    if (!slug) return
    setAudience({ slug, questions: questionsKey ? questionsKey.split('\n') : [] })
    return () => setAudience(null)
  }, [slug, questionsKey, setAudience])

  const chips = audience?.questions.length ? audience.questions.slice(0, 4) : CHIPS

  if (!enabled) return null

  const ask = (text: string) => {
    if (!text.trim()) return
    openAssistant(text)
    setInput('')
  }

  return (
    <section className="assistant-bar" aria-labelledby="assistant-bar-title">
      <div className="assistant-bar__inner">
        <p className="home-eyebrow">Direct antwoord</p>
        <h2 className="home-h2" id="assistant-bar-title">
          Stel je <span>vraag</span>
        </h2>
        <p className="assistant-bar__intro">
          Over het programma, de uitslagen, het lidmaatschap of vrijwilligerswerk: je krijgt meteen
          antwoord.
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
