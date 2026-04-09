import type { Sponsor, Media } from '@/payload-types'

type Props = {
  sponsor?: Sponsor | number | null
  bare?: boolean
}

export default function TeamSponsorSection({ sponsor, bare }: Props) {
  const s = typeof sponsor === 'object' && sponsor !== null ? sponsor : null

  const content = s ? (
    <div className="team-sponsor-logos">
      {(() => {
        const logo = s.logo as Media | null
        const logoUrl = logo?.url ?? null
        const img = logoUrl ? (
          <img src={logoUrl} alt={s.name} className="team-sponsor-logo-img" />
        ) : null

        return s.url ? (
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="team-sponsor-link"
            title={s.name}
          >
            {img}
          </a>
        ) : (
          img
        )
      })()}
    </div>
  ) : (
    <p className="team-sponsor-empty">Dit team heeft nog geen sponsor.</p>
  )

  if (bare) return content

  return (
    <div className="card-sponsor card">
      <h2 className="team-sponsor-title">Sponsor</h2>
      {content}
    </div>
  )
}
