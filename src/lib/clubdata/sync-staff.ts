import type { Payload } from 'payload'
import { fetchClubData } from '@/lib/clubdata/fetch'
import { transformTeamRoster } from '@/lib/clubdata/transform'
import type { RawTeamIndelingResponse } from '@/lib/clubdata/types'

export type StaffSyncResult = {
  teams: number
  created: number
  deleted: number
  failedTeams: string[]
}

const staffKey = (name: string, role: string) => `${name}|${role}`

/**
 * Mirrors the staff of every team from Club.Dataservice into `team-staff`.
 *
 * Players are dropped here, at the source, so they never reach our database.
 * Members the club has shielded (`relatiecode: null`) are skipped by
 * `transformTeamRoster`, same as on the public team pages.
 *
 * A team whose API call fails is left untouched, so an outage never wipes data.
 */
export async function syncTeamStaff(payload: Payload): Promise<StaffSyncResult> {
  const { docs: teams } = await payload.find({
    collection: 'teams',
    limit: 200,
    depth: 0,
    select: { name: true, teamcode: true },
  })

  const result: StaffSyncResult = { teams: 0, created: 0, deleted: 0, failedTeams: [] }

  for (const team of teams) {
    if (!team.teamcode) {
      continue
    }

    let raw: RawTeamIndelingResponse
    try {
      raw = await fetchClubData<RawTeamIndelingResponse>('team-indeling', {
        teamcode: String(team.teamcode),
        lokaleteamcode: 'NULL',
        toonlidfoto: 'NEE',
      })
    } catch {
      result.failedTeams.push(team.name)
      continue
    }

    const wanted = transformTeamRoster(raw).staff.flatMap(({ role, members }) =>
      members.map((m) => ({ name: m.name, role })),
    )
    const { docs: existing } = await payload.find({
      collection: 'team-staff',
      where: { team: { equals: team.id } },
      limit: 200,
      depth: 0,
      pagination: false,
    })

    const wantedKeys = new Set(wanted.map((w) => staffKey(w.name, w.role)))
    const existingKeys = new Set(existing.map((e) => staffKey(e.name, e.role)))

    for (const doc of existing) {
      if (wantedKeys.has(staffKey(doc.name, doc.role))) {
        continue
      }
      await payload.delete({ collection: 'team-staff', id: doc.id })
      result.deleted++
    }
    for (const member of wanted) {
      if (existingKeys.has(staffKey(member.name, member.role))) {
        continue
      }
      await payload.create({
        collection: 'team-staff',
        data: { ...member, team: team.id },
      })
      result.created++
    }
    result.teams++
  }

  return result
}
