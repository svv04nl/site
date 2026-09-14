import type { Sponsor, Media } from '@/payload-types'

type Props = {
  sponsors?: (Sponsor | number)[] | null
}

export default function TeamSponsorSection({ sponsors }: Props) {
  const items = (sponsors ?? []).filter(
    (s): s is Sponsor => typeof s === 'object' && s !== null,
  )

  const content =
    items.length > 0 ? (
      <div className="team-sponsor-logos">
        {items.map((s) => {
          const logo = s.logo as Media | null
          const logoUrl = logo?.url ?? null
          const img = logoUrl ? (
            <img key={s.id} src={logoUrl} alt={s.name} className="team-sponsor-logo-img" />
          ) : null

          return s.url ? (
            <a
              key={s.id}
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
        })}
      </div>
    ) : (
      <p className="team-sponsor-empty">Dit team heeft nog geen sponsor.</p>
    )

  return (
    <div className="sidebar-section">
      <h2 className="sidebar-section-title">Tenue sponsor</h2>
      <div className="card-sponsor card">{content}</div>
    </div>
  )
}
