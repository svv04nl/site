import { ROLE_SLUGS, SITE_URL } from '@/lib/app-api/config'
import type { LinkDto, LinkTarget, RoleSlug, ScreenName } from '@/lib/app-api/types'

const SITE_HOSTS = new Set(['svv04.nl', 'www.svv04.nl', 'svv04.vercel.app'])

const screen = (name: ScreenName, extra: { slug?: string; contactTopic?: string } = {}): LinkTarget => ({
  kind: 'screen',
  screen: name,
  ...extra,
})

export const screenTarget = screen

/**
 * Where a site link (a path like "/vereniging/lidmaatschap" or a full URL) leads in the app.
 * Paths the app has a screen for become screen targets; the rest opens the website.
 */
export function hrefToTarget(href: string): LinkTarget {
  const raw = href.trim()
  if (/^(mailto|tel):/i.test(raw)) return { kind: 'browser', url: raw, inApp: false }

  let url: URL
  try {
    url = new URL(raw, SITE_URL)
  } catch {
    return { kind: 'browser', url: SITE_URL, inApp: true }
  }
  if (!/^https?:$/.test(url.protocol)) return { kind: 'browser', url: raw, inApp: false }
  if (!SITE_HOSTS.has(url.hostname)) return { kind: 'browser', url: url.toString(), inApp: true }

  const segments = url.pathname.split('/').filter(Boolean)
  const [first, second] = segments
  const last = segments.at(-1)

  switch (first) {
    case undefined:
      return screen('home')
    case 'nieuws':
      return second ? screen('post', { slug: second }) : screen('posts')
    case 'teams':
      return second ? screen('team', { slug: second }) : screen('teams')
    case 'senioren':
    case 'jeugd':
      return screen('teams')
    case 'programma':
      return screen('program')
    case 'agenda':
      return screen('activities')
    case 'assistent':
      return screen('assistant')
    case 'alle-sponsors':
      return screen('sponsors')
    case 'contact': {
      const topic = url.searchParams.get('afdeling')
      return screen('contacts', topic ? { contactTopic: topic } : {})
    }
    case 'privacy':
    case 'cookies':
      return screen('page', { slug: first })
    case 'vereniging':
    case 'commissies':
    case 'meedoen':
      // The sponsor options moved to the "Voor jou" page (see next.config.ts).
      if (first === 'vereniging' && last === 'sponsoring') return screen('audience', { slug: 'sponsoring' })
      return last && segments.length > 1 ? screen('page', { slug: last }) : screen('club')
    default:
      if (segments.length === 1 && (ROLE_SLUGS as readonly string[]).includes(first)) {
        return screen('audience', { slug: first as RoleSlug })
      }
      return { kind: 'browser', url: url.toString(), inApp: true }
  }
}

export function link(title: string, target: LinkTarget, extra: { subtitle?: string; icon?: string } = {}): LinkDto {
  return {
    title,
    ...(extra.subtitle ? { subtitle: extra.subtitle } : {}),
    ...(extra.icon ? { icon: extra.icon } : {}),
    target,
  }
}

export const linkToHref = (title: string, href: string, subtitle?: string | null): LinkDto =>
  link(title, hrefToTarget(href), { subtitle: subtitle || undefined })
