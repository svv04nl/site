import React from 'react'

type Tier = {
  name?: string | null
  level?: string | null
  duration?: string | null
  items?: { text?: string | null }[] | null
}

type Props = {
  tiers?: Tier[] | null
}

export default function PackageTiersBlockComponent({ tiers }: Props) {
  const resolved = (tiers ?? []).filter((t) => t.name)
  if (resolved.length === 0) {
    return null
  }

  return (
    <div className="package-tiers">
      {resolved.map((tier, i) => {
        const items = (tier.items ?? []).filter((item) => item.text)
        return (
          <section
            className={`package-tier package-tier--${tier.level ?? 'basis'}`}
            key={i}
            aria-label={tier.name ?? undefined}
          >
            <header className="package-tier-head">
              <h4 className="package-tier-name">{tier.name}</h4>
              {tier.duration && <p className="package-tier-duration">{tier.duration}</p>}
            </header>
            {items.length > 0 && (
              <ul className="package-tier-items">
                {items.map((item, j) => (
                  <li key={j}>{item.text}</li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
