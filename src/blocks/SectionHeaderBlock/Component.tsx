import React from 'react'

type Props = {
  eyebrow?: string | null
  title?: string | null
  intro?: string | null
}

// Same *asterisk* convention as the quote block: wrapped text gets the accent colour.
function renderTitle(title: string) {
  return title
    .split(/\*(.+?)\*/g)
    .map((part, i) =>
      i % 2 === 1 ? <span key={i}>{part}</span> : <React.Fragment key={i}>{part}</React.Fragment>,
    )
}

export default function SectionHeaderBlockComponent({ eyebrow, title, intro }: Props) {
  if (!title) {
    return null
  }

  return (
    <header className="section-header-block">
      {eyebrow && <p className="section-header-block-eyebrow">{eyebrow}</p>}
      <h2 className="section-header-block-title">{renderTitle(title)}</h2>
      {intro && <p className="section-header-block-intro">{intro}</p>}
    </header>
  )
}
