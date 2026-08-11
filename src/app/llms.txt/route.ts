import { getPayload } from 'payload'
import config from '@payload-config'

// Capitalise only the first letter, leaving the rest as-is (Dutch casing).
const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

// Render on request, not at build time: this route queries CMS content, so it
// must stay in sync with the database without a redeploy and must not make the
// build depend on database contents.
export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getPayload({ config })

  const [{ docs: posts }, { docs: teams }, { docs: pages }, { docs: audiences }] =
    await Promise.all([
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
      payload.find({
        collection: 'audiences',
        limit: 0,
        depth: 0,
        sort: 'order',
        select: { name: true, slug: true, cardDescription: true },
      }),
    ])

  const seniorTeams = teams.filter((t) => t.type === 'senior')
  const youthTeams = teams.filter((t) => t.type === 'youth')
  const verenigingPages = pages.filter((p) => p.section === 'vereniging')
  const commissiesPages = pages.filter((p) => p.section === 'commissies')
  const meedoenPages = pages.filter((p) => p.section === 'meedoen')

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
    '- [Voor jou](https://svv04.nl/) — doelgroeppagina\'s (spelers, ouders, trainers, vrijwilligers, sponsoren)',
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

  if (audiences.length > 0) {
    lines.push('## Voor jou', '')
    for (const audience of audiences) {
      const description = audience.cardDescription ? ` — ${audience.cardDescription}` : ''
      lines.push(
        `- [${capitalise(audience.name)}](https://svv04.nl/voor-jou/${audience.slug})${description}`,
      )
    }
    lines.push('')
  }

  if (verenigingPages.length > 0) {
    lines.push('## Verenigingspagina\'s', '')
    for (const page of verenigingPages) {
      lines.push(`- [${page.title}](https://svv04.nl/vereniging/${page.slug})`)
    }
    lines.push('')
  }

  if (commissiesPages.length > 0) {
    lines.push('## Commissies', '')
    for (const page of commissiesPages) {
      lines.push(`- [${page.title}](https://svv04.nl/commissies/${page.slug})`)
    }
    lines.push('')
  }

  if (meedoenPages.length > 0) {
    lines.push('## Meedoen', '')
    for (const page of meedoenPages) {
      lines.push(`- [${page.title}](https://svv04.nl/meedoen/${page.slug})`)
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
