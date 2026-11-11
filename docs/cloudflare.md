# Hosting op Cloudflare Workers

De site draait als één Cloudflare Worker (`site`, account **SVV04**), gebouwd met
[OpenNext](https://opennext.js.org/cloudflare). Neon is de database. Er hangt niets meer aan Vercel.

## Opbouw

| Onderdeel     | Waar                                        | Wat                                                          |
| ------------- | ------------------------------------------- | ------------------------------------------------------------ |
| Worker        | `wrangler.jsonc`, `worker.ts`               | De Next-app van OpenNext plus de Cron Triggers               |
| Build         | `open-next.config.ts`, `pnpm cf:build`      | `next build --webpack` en daarna de OpenNext-bundel          |
| Database      | binding `HYPERDRIVE`                        | Connection pool naar de productiebranch van Neon             |
| Media         | R2-bucket `svv04-media`, binding `MEDIA`    | Uploads van Payload, geserveerd via `/media/<bestand>`       |
| Beeldformaten | binding `IMAGES`, `/api/img/<formaat>/<id>` | Vervangt sharp (zie `src/lib/media-sizes.ts`)                |
| Next-cache    | R2-bucket `svv04-opennext-cache`            | fetch-revalidate en `revalidatePath`                         |
| Botcontrole   | Turnstile                                   | Formulieren, chat en donaties (`src/lib/turnstile.ts`)       |
| Analytics     | Cloudflare Web Analytics                    | Bezoeken en Core Web Vitals, zonder cookies                  |
| Assistent     | binding `AI`, AI Gateway `svv04`            | Claude Haiku 5.5 via Unified Billing (`src/lib/ai/agent.ts`) |
| Omgeving      | var `SITE_ENV`                              | `production` of `preview` (`src/lib/site-env.ts`)            |
| Crons         | `triggers.crons`                            | 04:00 UTC sync-staff, 04:30 UTC reconcile-donations          |
| CI/CD         | `.github/workflows/`                        | `deploy.yml` (main), `preview.yml` (PR's)                    |

Adressen: productie op `site.svv04.workers.dev` (tot `svv04.nl` naar Cloudflare gaat), previews
op `<branch-slug>-site.svv04.workers.dev`.

**Media zijn gedeeld.** Lokaal (`next dev`, `wrangler dev`), previews en productie gebruiken
dezelfde bucket `svv04-media` (de binding staat op `remote: true`). Een bestand dat je lokaal of
in een preview verwijdert, is ook op productie weg.

## Setup (staat al)

### Cloudflare

- **Workers Paid** ($5 per maand, gedeeld met de ZOD-site op hetzelfde account). Het gratis plan
  geeft 10 ms CPU per request; dat is te weinig voor Payload.
- **Hyperdrive** `svv04-neon` naar de productiebranch van Neon, via de verbinding **zonder**
  pooler (Hyperdrive pooled zelf).
- **R2**: `svv04-media` (media) en `svv04-opennext-cache` (cache van Next).
- **Turnstile**-widget (modus _Invisible_) voor `svv04.nl`, `www.svv04.nl` en `svv04.workers.dev`.
- **Web Analytics** voor `svv04.nl`.
- **AI Gateway** `svv04`: Authenticated Gateway aan, tegoed via Unified Billing (alleen met een
  creditcard; 5% over het opgeladen bedrag), spend limit en rate limit. Voor lokaal testen
  buiten de Worker: een API-token met _Workers AI Read_ als `CLOUDFLARE_AI_API_TOKEN` in
  `.env.local`, met `CLOUDFLARE_ACCOUNT_ID`.

### Secrets van de Worker

Zetten of wijzigen met `pnpm wrangler secret put <NAAM>`.

| Secret                 | Waarvoor                                                        |
| ---------------------- | --------------------------------------------------------------- |
| `PAYLOAD_SECRET`       | Payload (en het token van de toegangscode)                      |
| `DATABASE_URL`         | Alleen als terugvaloptie; normaal gebruikt de Worker Hyperdrive |
| `RESEND_API_KEY`       | E-mail                                                          |
| `MOLLIE_API_KEY`       | Tribune-donaties                                                |
| `CRON_SECRET`          | De crons                                                        |
| `TURNSTILE_SECRET_KEY` | Botcontrole                                                     |
| `AI_ASSISTANT_ENABLED` | `true` of `false`                                               |
| `SITE_ACCESS_CODE`     | Toegangscode zolang de site nog niet open is                    |

### GitHub

Environments `Production` en `Preview`.

**Variables** (repo-niveau): `CLOUDFLARE_ACCOUNT_ID`, `NEON_PROJECT_ID`,
`NEXT_PUBLIC_CLUBDATA_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CF_BEACON_TOKEN`, `AI_ASSISTANT_ENABLED`.

**Secrets**:

| Secret                                  | `Production` | `Preview`                 |
| --------------------------------------- | ------------ | ------------------------- |
| `CLOUDFLARE_API_TOKEN`                  | ✓            | ✓                         |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | productie    | (komt van de Neon-branch) |
| `PAYLOAD_SECRET`                        | productie    | preview-waarde            |
| `RESEND_API_KEY`                        | ✓            | ✓                         |
| `CRON_SECRET`                           |              | ✓                         |
| `MOLLIE_API_KEY`                        |              | **test**-sleutel          |
| `NEON_API_KEY` (repo, Neon-koppeling)   | ✓            | ✓                         |

Op `main` zijn geen checks verplicht; een PR is wel verplicht, en alleen squash-merges.

## Live gaan

1. **DNS**: `svv04.nl` staat bij Oxilion. Voeg de zone toe aan Cloudflare (gratis plan),
   controleer dat **alle** records zijn overgenomen (vooral MX, SPF, DKIM en de
   Resend-records) en zet de nameservers bij de registrar om.
2. Koppel `svv04.nl` (en `www`) als _Custom Domain_ aan de Worker `site`.
3. Haal `SITE_ACCESS_CODE` weg (`pnpm wrangler secret delete SITE_ACCESS_CODE`) als de site open mag.
4. Zet de app (`../app`, `AppConfig.swift`) op `https://svv04.nl`.

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
