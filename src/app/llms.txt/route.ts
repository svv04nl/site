import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  const [{ docs: posts }, { docs: teams }, { docs: pages }] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 20,
      depth: 0,
      select: { title: true, slug: true, excerpt: true, publishedAt: true },
    }),
    payload.find({
      collection: 'teams',
      limit: 0,
      depth: 0,
      select: { name: true, slug: true, type: true, category: true },
    }),
    payload.find({
      collection: 'pages',
      limit: 0,
      depth: 0,
      select: { title: true, slug: true, section: true },
    }),
  ])

  const seniorTeams = teams.filter((t) => t.type === 'senior')
  const youthTeams = teams.filter((t) => t.type === 'youth')

  const lines: string[] = [
    '# SVV\'04 Schoonebeek',
    '',
    '> Officiële website van SVV\'04 Schoonebeek, een amateurvoetbalvereniging uit Schoonebeek, Nederland.',
    '',
    '## Secties',
    '',
    '- [Nieuws](https://svv04.nl/nieuws) — clubnieuws en wedstrijdverslagen',
    '- [Senioren](https://svv04.nl/senioren) — overzicht seniorenteams',
    '- [Jeugd](https://svv04.nl/jeugd) — overzicht jeugdteams',
    '- [Programma](https://svv04.nl/programma) — wedstrijdprogramma en standen',
    '- [Agenda](https://svv04.nl/agenda) — clubagenda',
    '- [Contact](https://svv04.nl/contact) — contactgegevens',
    '',
  ]

  if (seniorTeams.length > 0) {
    lines.push('## Seniorenteams', '')
    for (const team of seniorTeams) {
      lines.push(`- [${team.name}](https://svv04.nl/teams/${team.slug})${team.category ? ` — ${team.category}` : ''}`)
    }
    lines.push('')
  }

  if (youthTeams.length > 0) {
    lines.push('## Jeugdteams', '')
    for (const team of youthTeams) {
      lines.push(`- [${team.name}](https://svv04.nl/teams/${team.slug})${team.category ? ` — ${team.category}` : ''}`)
    }
    lines.push('')
  }

  if (pages.length > 0) {
    lines.push('## Verenigingspagina\'s', '')
    for (const page of pages) {
      lines.push(`- [${page.title}](https://svv04.nl/${page.section}/${page.slug})`)
    }
    lines.push('')
  }

  if (posts.length > 0) {
    lines.push('## Recente nieuwsberichten', '')
    for (const post of posts) {
      const date = post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : ''
      const excerpt = post.excerpt ? ` — ${post.excerpt}` : ''
      lines.push(`- [${post.title}](https://svv04.nl/nieuws/${post.slug})${date ? ` (${date})` : ''}${excerpt}`)
    }
    lines.push('')
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
