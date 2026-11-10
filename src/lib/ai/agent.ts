import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createAI, type CloudflareLanguageModelId } from 'agents/models/ai-sdk'
import { ToolLoopAgent, isStepCount } from 'ai'
import { buildInstructions } from '@/lib/ai/prompt'
import {
  getClubInfo,
  getPage,
  getContacts,
  getLatestNews,
  listTeams,
  searchSite,
  siteMapForPrompt,
} from '@/lib/ai/tools/site'
import { findStaff } from '@/lib/ai/tools/staff'
import {
  getClubActivities,
  getClubSchedule,
  getMatchDetails,
  getTeamResults,
  getTeamSchedule,
  getTeamStandings,
} from '@/lib/ai/tools/clubdata'

// A model from the Cloudflare AI Gateway catalog (https://developers.cloudflare.com/ai/models/).
// The gateway bills it through Unified Billing; no Anthropic key needed.
const DEFAULT_MODEL = 'anthropic/claude-haiku-5.5'

/** The gateway in the Cloudflare dashboard with the logs, spend limit and rate limit. */
const GATEWAY = 'svv04'

/**
 * The model through Cloudflare AI Gateway. In the Worker through the AI binding; elsewhere
 * (next dev without the binding, scripts) through an account id and API token with
 * Workers AI Read.
 */
export async function assistantModel() {
  const id = (process.env.AI_ASSISTANT_MODEL || DEFAULT_MODEL) as CloudflareLanguageModelId
  const binding = await getCloudflareContext({ async: true })
    .then(({ env }) => env.AI)
    .catch(() => undefined)
  if (binding) return createAI({ binding, gateway: GATEWAY })(id)

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_AI_API_TOKEN
  if (accountId && apiToken) return createAI({ accountId, apiToken, gateway: GATEWAY })(id)

  throw new Error(
    'AI-assistent: geen AI-binding en geen CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_AI_API_TOKEN',
  )
}

export const isAssistantEnabled = () => process.env.AI_ASSISTANT_ENABLED === 'true'

/** Shows tool calls, token usage and timing on the test page. Never on for visitors. */
export const isAssistantDebug = () => process.env.AI_ASSISTANT_DEBUG === 'true'

export async function createAssistantAgent({
  audience,
  favoriteTeams,
}: { audience?: string | null; favoriteTeams?: string[] } = {}) {
  return new ToolLoopAgent({
    model: await assistantModel(),
    instructions: buildInstructions(await siteMapForPrompt(), audience, favoriteTeams),
    tools: {
      searchSite,
      getPage,
      getLatestNews,
      getContacts,
      getClubInfo,
      listTeams,
      findStaff,
      getTeamSchedule,
      getTeamResults,
      getTeamStandings,
      getClubSchedule,
      getMatchDetails,
      getClubActivities,
    },
    stopWhen: isStepCount(6),
    maxOutputTokens: 1200,
  })
}
