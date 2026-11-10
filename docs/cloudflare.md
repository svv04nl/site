# Hosting op Cloudflare Workers

De site draait als één Cloudflare Worker, gebouwd met [OpenNext](https://opennext.js.org/cloudflare).
Neon blijft de database, Vercel Blob voorlopig de media-opslag.

## Opbouw

| Onderdeel     | Waar                                        | Wat                                                    |
| ------------- | ------------------------------------------- | ------------------------------------------------------ |
| Worker        | `wrangler.jsonc`, `worker.ts`               | De Next-app van OpenNext plus de Cron Triggers         |
| Build         | `open-next.config.ts`, `pnpm cf:build`      | `next build --webpack` en daarna de OpenNext-bundel    |
| Database      | binding `HYPERDRIVE`                        | Connection pool naar de productiebranch van Neon       |
| Next-cache    | R2-bucket `svv04-opennext-cache`            | fetch-revalidate en `revalidatePath`                   |
| Beeldformaten | binding `IMAGES`, `/api/img/<formaat>/<id>` | Vervangt sharp (zie `src/lib/media-sizes.ts`)          |
| Botcontrole   | Turnstile                                   | Formulieren, chat en donaties (`src/lib/turnstile.ts`) |
| Analytics     | Cloudflare Web Analytics                    | Vervangt Vercel Analytics en Speed Insights            |
| Assistent     | binding `AI`, AI Gateway `svv04`            | Claude Haiku 5.5 via Unified Billing (`src/lib/ai/agent.ts`) |
| Crons         | `triggers.crons`                            | 04:00 UTC sync-staff, 04:30 UTC reconcile-donations    |
| CI/CD         | `.github/workflows/`                        | `deploy.yml` (main), `preview.yml` (PR's)              |

## Eenmalige setup

### 1. Cloudflare

1. Gebruik het account **SVV04** (`account_id` staat in `wrangler.jsonc`) en zet **Workers Paid** aan ($5 per maand). Het gratis plan geeft
   10 ms CPU per request; dat is te weinig voor Payload.
2. Hyperdrive naar de productiebranch van Neon (gebruik de verbinding **zonder** pooler,
   Hyperdrive pooled zelf):

   ```sh
   pnpm wrangler hyperdrive create svv04-neon --connection-string="postgresql://...neon.tech/neondb?sslmode=require"
   ```

   Staat al in `wrangler.jsonc` (config `svv04-neon`).

3. R2-bucket voor de cache:

   ```sh
   pnpm wrangler r2 bucket create svv04-opennext-cache
   ```

4. **Turnstile**: maak een widget aan (modus _Invisible_) voor `svv04.nl` en
   `*.workers.dev`. Dat geeft een site key (publiek) en een secret key.
5. **Web Analytics**: voeg de site toe en neem het token over.
6. **AI Gateway** voor de assistent:
   - Maak een gateway `svv04` aan en zet **Authenticated Gateway** aan (nodig voor Unified Billing).
   - Laad tegoed op onder *AI Gateway → Credits* (alleen met een creditcard; Cloudflare rekent 5%
     over het opgeladen bedrag, de tokenprijzen zijn gelijk aan die van Anthropic).
   - Zet een **spend limit** op de gateway, bijvoorbeeld $10 per maand, en een rate limit per
     minuut. Dan kan een misbruikte chat nooit veel kosten.
   - Voor lokaal testen buiten de Worker: een API-token met *Workers AI Read* als
     `CLOUDFLARE_AI_API_TOKEN` in `.env.local`, met `CLOUDFLARE_ACCOUNT_ID`.
7. **API-token** voor GitHub Actions: sjabloon _Edit Cloudflare Workers_, plus R2 bewerken.

### 2. Secrets van de Worker (productie)

Eén keer zetten met `pnpm wrangler secret put <NAAM>`. De waarden staan nu nog in Vercel
(_Production_).

| Secret                  | Waarvoor                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `PAYLOAD_SECRET`        | Payload (en het token van de toegangscode)                                                                            |
| `DATABASE_URL`          | Alleen als terugvaloptie; normaal gebruikt de Worker Hyperdrive                                                       |
| `BLOB_READ_WRITE_TOKEN` | Media in Vercel Blob                                                                                                  |
| `RESEND_API_KEY`        | E-mail                                                                                                                |
| `MOLLIE_API_KEY`        | Tribune-donaties (live-sleutel)                                                                                       |
| `CRON_SECRET`           | De crons                                                                                                              |
| `TURNSTILE_SECRET_KEY`  | Botcontrole                                                                                                           |
| `AI_ASSISTANT_ENABLED`  | `true` of `false`                                                                                                     |
| `SITE_ACCESS_CODE`      | Toegangscode zolang de site nog niet open is                                                                          |

### 3. GitHub

Maak in de repo twee environments aan, `production` en `preview`.

**Variables** (repo-niveau):
`CLOUDFLARE_ACCOUNT_ID`, `NEON_PROJECT_ID`, `NEXT_PUBLIC_CLUBDATA_CLIENT_ID`,
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
`NEXT_PUBLIC_CF_BEACON_TOKEN`, `AI_ASSISTANT_ENABLED`.

**Secrets**:

| Secret                                                | `production` | `preview`                 |
| ----------------------------------------------------- | ------------ | ------------------------- |
| `CLOUDFLARE_API_TOKEN`                                | ✓            | ✓                         |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED`               | productie    | (komt van de Neon-branch) |
| `PAYLOAD_SECRET`                                      | productie    | preview-waarde            |
| `BLOB_READ_WRITE_TOKEN`                               | ✓            | ✓                         |
| `NEON_API_KEY`                                        |              | ✓                         |
| `RESEND_API_KEY`, `CRON_SECRET` |              | ✓                         |
| `MOLLIE_API_KEY`                                      |              | **test**-sleutel          |

Pas daarna de branch protection van `main` aan: de verplichte check wordt de job
_Preview deployen_ in plaats van de Vercel-check.

### 4. Neon

De Vercel-integratie maakte per preview een branch `preview/<git-branch>`. Ontkoppel de
integratie bij de overstap en verwijder de oude preview-branches: ze tellen mee voor het
maximum aantal branches op het gratis plan. De nieuwe previews heten `preview/pr-<nummer>`.

## Overstap

1. Merge deze branch. Vercel blijft draaien; de GitHub Action deployt de Worker naar
   `site.svv04.workers.dev`. Vanaf dan draaien de crons dubbel (Vercel en Cloudflare).
   Dat kan geen kwaad: beide zijn idempotent.
2. Test daar: pagina's, het adminscherm (inloggen, opslaan, een afbeelding uploaden), een
   donatie in testmodus, het contactformulier en de chat.
3. **DNS**: `svv04.nl` staat nu bij Oxilion. Voeg de zone toe aan Cloudflare (gratis plan),
   controleer dat **alle** records zijn overgenomen (vooral MX, SPF, DKIM en de
   Resend-records) en zet de nameservers bij de registrar om.
4. Koppel `svv04.nl` (en `www`) als _Custom Domain_ aan de Worker.
5. Na een week zonder problemen: haal `vercel.json` en `scripts/vercel-build.sh` weg en
   pauzeer het Vercel-project. Daarmee stoppen ook de dubbele crons.

**Terug naar Vercel** kan zolang het Vercel-project bestaat: zet het domein weer op Vercel.
Let op: Vercel bouwt deze code nog wel, maar zonder sharp krijgen nieuwe uploads daar geen
eigen formaten; de site toont dan het origineel.

## Lokaal testen

```sh
pnpm cf:build
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="<dev DATABASE_URL>" \
  pnpm wrangler dev --env-file .env.local
```

Een cron lokaal aanroepen:

```sh
curl -X POST "http://localhost:8787/cdn-cgi/local/explorer/api/local/scheduled?worker=site" \
  -H 'content-type: application/json' -d '{"cron":"30 4 * * *"}'
```
