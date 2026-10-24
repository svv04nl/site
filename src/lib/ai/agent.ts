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

// Plain "provider/model" string: routed through Vercel AI Gateway.
const DEFAULT_MODEL = 'anthropic/claude-haiku-5.5'

export const isAssistantEnabled = () => process.env.AI_ASSISTANT_ENABLED === 'true'

/** Shows tool calls, token usage and timing on the test page. Never on for visitors. */
export const isAssistantDebug = () => process.env.AI_ASSISTANT_DEBUG === 'true'

export async function createAssistantAgent({ audience }: { audience?: string | null } = {}) {
  return new ToolLoopAgent({
    model: process.env.AI_ASSISTANT_MODEL || DEFAULT_MODEL,
    instructions: buildInstructions(await siteMapForPrompt(), audience),
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
