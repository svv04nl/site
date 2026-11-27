'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { teamRosterQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'

/**
 * Trainers, assistants and leaders from the team's selection in Sportlink. Names and roles
 * only: no phone numbers or a message button, those go through the contact page.
 */
export default function TeamStaffSection() {
  const { teamcode } = useTeam()
  const { data } = useQuery(teamRosterQuery(teamcode))
  const staff = (data?.staff ?? []).flatMap((group) =>
    group.members.map((m) => ({ name: m.name, role: m.role || group.role || 'Staf' })),
  )

  if (staff.length === 0) {
    return null
  }

  return (
    <div className="sidebar-section">
      <h2 className="sidebar-section-title">Trainer en assistenten</h2>
      <ul className="team-staff">
        {staff.map((m) => (
          <li key={`${m.name}-${m.role}`} className="team-staff__row">
            <span className="team-staff__name">{m.name}</span>
            <span className="team-staff__role">{m.role}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
