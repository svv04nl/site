'use client'

import { useQuery } from '@tanstack/react-query'
import { teamSponsorsQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'

export default function TeamSponsorSection() {
  const { teamcode } = useTeam()
  const { data: sponsors } = useQuery(teamSponsorsQuery(teamcode))

  return (
    <div className="team-sponsor-card">
      <h2 className="team-sponsor-title">Sponsor</h2>
      {sponsors && sponsors.length > 0 ? (
        <div className="team-sponsor-logos">
          {sponsors.map((sponsor) =>
            sponsor.website ? (
              <a
                key={sponsor.naam}
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="team-sponsor-link"
                title={sponsor.naam}
              >
                <img
                  src={`data:image/png;base64,${sponsor.logo}`}
                  alt={sponsor.naam}
                  className="team-sponsor-logo-img"
                />
              </a>
            ) : (
              <img
                key={sponsor.naam}
                src={`data:image/png;base64,${sponsor.logo}`}
                alt={sponsor.naam}
                className="team-sponsor-logo-img"
              />
            ),
          )}
        </div>
      ) : (
        <p className="team-sponsor-empty">Dit team heeft nog geen sponsor.</p>
      )}
    </div>
  )
}
