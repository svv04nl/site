import React from 'react'

type Card = {
  icon?: string | null
  title?: string | null
  description?: string | null
  summary?: string | null
  details?: { text?: string | null }[] | null
  badge?: string | null
}

type Props = {
  cards?: Card[] | null
  /** `compact` shows the short text and fits four cards in a row. */
  variant?: 'detailed' | 'compact' | null
}

// Lucide-style 24x24 stroke icons, drawn inline so the block has no icon dependency.
const ICONS: Record<string, React.ReactNode> = {
  board: (
    <>
      <rect x="2" y="5" width="20" height="11" rx="1.5" />
      <path d="M6 10.5h12" />
      <path d="M7 16v4" />
      <path d="M17 16v4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  book: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  newspaper: (
    <>
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m12 7 4 3-1.5 4.5h-5L8 10z" />
      <path d="M12 7V2.2" />
      <path d="m16 10 4.8-1.5" />
      <path d="m14.5 14.5 3 4.5" />
      <path d="m9.5 14.5-3 4.5" />
      <path d="M8 10 3.2 8.5" />
    </>
  ),
  flag: (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
    </>
  ),
  seat: (
    <>
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
      <path d="M5 18v2" />
      <path d="M19 18v2" />
    </>
  ),
  shirt: (
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  ),
  trophy: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </>
  ),
}

export default function OptionCardsBlockComponent({ cards, variant }: Props) {
  const compact = variant === 'compact'
  const resolved = (cards ?? []).filter((c) => c.title && c.description)
  if (resolved.length === 0) return null

  return (
    <ul
      className={`option-cards${compact ? ' option-cards--compact' : ''}`}
      data-count={resolved.length}
    >
      {resolved.map((card, i) => {
        const details = (card.details ?? []).filter((d) => d.text)
        return (
          <li className="option-card" key={i}>
            <span className="option-card-icon" aria-hidden="true">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ICONS[card.icon ?? 'board'] ?? ICONS.board}
              </svg>
            </span>
            <div className="option-card-body">
              <div className="option-card-head">
                <h4 className="option-card-title">{card.title}</h4>
                {card.badge && <span className="option-card-badge">{card.badge}</span>}
              </div>
              <p className="option-card-text">
                {compact && card.summary ? card.summary : card.description}
              </p>
              {details.length > 0 && (
                <ul className="option-card-details">
                  {details.map((d, j) => (
                    <li key={j}>{d.text}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
