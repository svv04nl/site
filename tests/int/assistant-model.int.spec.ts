// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: vi.fn() }))
vi.mock('agents/models/ai-sdk', () => ({
  createAI: vi.fn((settings: unknown) => (id: string) => ({ settings, id })),
}))
// De tools van de assistent laden de Payload-config; die is hier niet nodig.
vi.mock('@/lib/ai/tools/site', () => ({}))
vi.mock('@/lib/ai/tools/staff', () => ({}))
vi.mock('@/lib/ai/tools/clubdata', () => ({}))
vi.mock('@/lib/ai/prompt', () => ({}))

const { getCloudflareContext } = await import('@opennextjs/cloudflare')
const { assistantModel } = await import('@/lib/ai/agent')

const ENV_KEYS = ['AI_ASSISTANT_MODEL', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_AI_API_TOKEN'] as const

describe('assistantModel', () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) delete process.env[key]
  })
  afterEach(() => vi.clearAllMocks())

  it('gebruikt in de Worker de AI-binding en de gateway svv04', async () => {
    const binding = { run: vi.fn() }
    vi.mocked(getCloudflareContext).mockResolvedValue({ env: { AI: binding } } as any)

    expect(await assistantModel()).toEqual({
      settings: { binding, gateway: 'svv04' },
      id: 'anthropic/claude-haiku-5.5',
    })
  })

  it('volgt AI_ASSISTANT_MODEL', async () => {
    process.env.AI_ASSISTANT_MODEL = 'anthropic/claude-sonnet-5.5'
    vi.mocked(getCloudflareContext).mockResolvedValue({ env: { AI: {} } } as any)

    expect(await assistantModel()).toMatchObject({ id: 'anthropic/claude-sonnet-5.5' })
  })

  it('valt buiten de Worker terug op account-id en API-token', async () => {
    vi.mocked(getCloudflareContext).mockRejectedValue(new Error('geen context'))
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acc'
    process.env.CLOUDFLARE_AI_API_TOKEN = 'token'

    expect(await assistantModel()).toEqual({
      settings: { accountId: 'acc', apiToken: 'token', gateway: 'svv04' },
      id: 'anthropic/claude-haiku-5.5',
    })
  })

  it('geeft een duidelijke fout zonder binding en zonder token', async () => {
    vi.mocked(getCloudflareContext).mockResolvedValue({ env: {} } as any)

    await expect(assistantModel()).rejects.toThrow(/CLOUDFLARE_AI_API_TOKEN/)
  })
})
