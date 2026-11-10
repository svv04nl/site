// Entry van de Worker: de Next-app die OpenNext bouwt, plus de dagelijkse crons uit
// wrangler.jsonc. Een cron roept dezelfde route aan als Vercel Cron vroeger deed, met
// CRON_SECRET, zodat de routes zelf niet veranderen.
// @ts-ignore: .open-next/worker.js bestaat pas na `opennextjs-cloudflare build`.
import handler from './.open-next/worker.js'

const CRON_ROUTES: Record<string, string> = {
  '0 4 * * *': '/api/cron/sync-staff',
  '30 4 * * *': '/api/cron/reconcile-donations',
}

type Env = { CRON_SECRET?: string } & Record<string, unknown>
type Ctx = { waitUntil(promise: Promise<unknown>): void; passThroughOnException(): void }

export default {
  fetch: handler.fetch,

  async scheduled(controller: { cron: string }, env: Env, ctx: Ctx) {
    const path = CRON_ROUTES[controller.cron]
    if (!path) throw new Error(`Onbekende cron: ${controller.cron}`)
    if (!env.CRON_SECRET) throw new Error('CRON_SECRET ontbreekt')

    const request = new Request(`https://svv04.nl${path}`, {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    })
    const response: Response = await handler.fetch(request, env, ctx)
    const body = await response.text()
    console.log(
      JSON.stringify({
        cron: controller.cron,
        path,
        status: response.status,
        body: body.slice(0, 2000),
      }),
    )
    if (!response.ok) throw new Error(`${path} gaf ${response.status}`)
  },
}
