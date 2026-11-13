'use client'

import React, { useEffect, useState } from 'react'
import { EXAMPLES } from '@/components/assistant/AssistantChat'
import { useAssistant, type AssistantAudience } from '@/components/assistant/AssistantProvider'
import { SparkleIcon } from '@/components/assistant/icons'
import { BramAvatar } from '@/components/assistant/BramAvatar'
import { useBramDocked } from '@/components/assistant/useBramDocked'
import { MAX_USER_MESSAGE_CHARS } from '@/lib/ai/limits'

const CHIPS = EXAMPLES.slice(0, 2)

// How long each example question stays in Bram's speech bubble.
const QUESTION_MS = 4500

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
  // Bram lands in the circle on the left when the band comes into view (the button at the
  // bottom right flies here) and stays while you scroll on past it.
  const docked = useBramDocked()

  const chips = audience?.questions.length ? audience.questions.slice(0, 2) : CHIPS
  // The speech bubble above Bram (laptop) shows the example questions in turn while he sits
  // in the band.
  const [turn, setTurn] = useState(0)
  const question = chips.length ? chips[turn % chips.length] : null
  useEffect(() => {
    if (!docked || chips.length < 2) {
      return
    }
    const timer = setInterval(() => setTurn((t) => t + 1), QUESTION_MS)
    return () => clearInterval(timer)
  }, [docked, chips.length])

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
          {question && (
            <button
              type="button"
              className="assistant-bar__question"
              onClick={() => ask(question)}
              tabIndex={docked ? 0 : -1}
            >
              <span key={question} className="assistant-bar__question-text">
                {question}
              </span>
            </button>
          )}
          <button
            type="button"
            className="assistant-bar__bram-button"
            onClick={() => openAssistant()}
            aria-label="Vraag het Bram"
            tabIndex={docked ? 0 : -1}
          >
            <BramAvatar size={160} />
          </button>
        </div>
        <div className="assistant-bar__head">
          <p className="home-eyebrow">Direct antwoord</p>
          <h2 className="home-h2" id="assistant-bar-title">
            Stel je <span>vraag</span>
            <span className="assistant-bar__to-bram"> aan Bram</span>
          </h2>
        </div>
        <p className="assistant-bar__intro">
          {intro ||
            "Bram, de zebra van SVV'04, weet alles over het programma, de uitslagen, het lidmaatschap en vrijwilligerswerk. Vraag het hem en je hebt meteen antwoord."}
        </p>
        <div className="assistant-bar__ask">
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
      </div>
    </section>
  )
}
