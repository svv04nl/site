import React from 'react'

type Props = {
  text?: string | null
}

function renderText(text: string) {
  return text.split(/\*(.+?)\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="quote-block-highlight">
        {part}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  )
}

export default function QuoteBlockComponent({ text }: Props) {
  if (!text) {
    return null
  }

  return (
    <blockquote className="quote-block">
      <p className="quote-block-text">{renderText(text)}</p>
      <span className="quote-block-rule" aria-hidden="true" />
    </blockquote>
  )
}
