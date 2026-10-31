import {
  audienceContact,
  audienceQuestions,
  loadAudiences,
} from '@/lib/app-api/audiences'
import { isRoleSlug } from '@/lib/app-api/config'
import { appRouteWithParams, notFound, slugParam, TTL } from '@/lib/app-api/http'
import { link, linkToHref, hrefToTarget } from '@/lib/app-api/links'

export const dynamic = 'force-dynamic'

const SUGGESTIONS = 6

export const GET = appRouteWithParams<{ slug: string }>(TTL.content, async (_request, { slug }) => {
  slugParam(slug, 'Deze pagina')
  const audience = isRoleSlug(slug) ? (await loadAudiences()).find((a) => a.slug === slug) : undefined
  if (!audience) throw notFound('Deze pagina')

  const contact = audienceContact(audience)
  const cta = audience.cta
  const showCta = cta?.enabled && cta.buttonLabel && cta.buttonUrl

  return {
    slug: audience.slug,
    title: audience.heroTitle || `Alles voor *${audience.name}* van SVV'04`,
    ...(audience.intro ? { intro: audience.intro } : {}),
    groups: (audience.themes ?? []).map((theme) => ({
      title: theme.title,
      ...(theme.intro ? { intro: theme.intro } : {}),
      links: (theme.links ?? []).map((l) => linkToHref(l.title, l.href, l.description)),
    })),
    ...(contact ? { contact } : {}),
    suggestions: audienceQuestions(audience).slice(0, SUGGESTIONS),
    ...(showCta
      ? { cta: link(cta.buttonLabel!, hrefToTarget(cta.buttonUrl!), { subtitle: cta.text || cta.title || undefined }) }
      : {}),
  }
})
