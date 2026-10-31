import { isAssistantEnabled } from '@/lib/ai/agent'
import { EXAMPLES, QUICK_LINKS } from '@/lib/ai/examples'
import { MAX_USER_MESSAGE_CHARS } from '@/lib/ai/limits'
import { loadAudiences, rolesOf } from '@/lib/app-api/audiences'
import {
  ASSISTANT_DISCLAIMER,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  TRIBUNE_URL,
  VOETBAL_NL,
  WEBSHOP_URL,
  minAppVersion,
} from '@/lib/app-api/config'
import { appRoute, TTL } from '@/lib/app-api/http'
import { linkToHref, screenTarget } from '@/lib/app-api/links'

export const dynamic = 'force-dynamic'

export const GET = appRoute(TTL.config, async () => ({
  minAppVersion: minAppVersion(),
  roles: rolesOf(await loadAudiences()),
  links: {
    voetbalNl: VOETBAL_NL,
    webshop: WEBSHOP_URL,
    tribune: TRIBUNE_URL,
    privacy: screenTarget('page', { slug: 'privacy' }),
    cookies: screenTarget('page', { slug: 'cookies' }),
    facebook: FACEBOOK_URL,
    instagram: INSTAGRAM_URL,
  },
  assistant: {
    enabled: isAssistantEnabled(),
    disclaimer: ASSISTANT_DISCLAIMER,
    maxInputLength: MAX_USER_MESSAGE_CHARS,
    defaultSuggestions: EXAMPLES,
    shortcuts: QUICK_LINKS.map((l) => linkToHref(l.label, l.href)),
  },
}))
