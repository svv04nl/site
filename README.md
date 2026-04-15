# SVV'04 Schoonebeek — Website

Website voor voetbalvereniging SVV'04 uit Schoonebeek. Gebouwd met Next.js, Payload CMS en gehost op Vercel.

## Tech stack

- **Next.js 16** (App Router) — frontend en server-side rendering
- **Payload CMS 3** — content management (teams, nieuws, pagina's, media, sponsors)
- **PostgreSQL** via [Neon](https://neon.tech) — database
- **Vercel Blob** — media-opslag
- **Resend** — e-mail
- **Vercel** — hosting en CI/CD

## Lokale ontwikkeling

### Vereisten

- Node.js ≥ 20
- pnpm ≥ 9
- Toegang tot Vercel project (voor env vars)

### Setup

```bash
# 1. Clone de repo
git clone <repo-url>
cd site

# 2. Haal lokale env vars op via Vercel CLI
vercel env pull .env.local

# 3. Installeer dependencies
pnpm install

# 4. Start de dev server
pnpm dev
```

Open `http://localhost:3000` voor de frontend en `http://localhost:3000/admin` voor het CMS.

De dev-omgeving gebruikt de **Neon `dev` branch** — gescheiden van productie. Schema-wijzigingen worden automatisch doorgevoerd (dev push, geen migraties nodig).

## Scripts

| Script | Beschrijving |
|--------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm devsafe` | Start dev server na schone `.next`-build |
| `pnpm build` | Productie build |
| `pnpm generate` | Genereer TypeScript types + import map |
| `pnpm migrate:create` | Maak een nieuwe migratie aan (alleen vóór productie-deploy) |
| `pnpm seed` | Seed basisdata (teams, etc.) |
| `pnpm seed:pages` | Seed standaardpagina's (vereniging, commissies, meedoen) |
| `pnpm seed:posts` | Seed nieuwsberichten |
| `pnpm sync:teamcodes` | Synchroniseer Sportlink teamcodes naar CMS |
| `pnpm fix:media-urls` | Herstel legacy media-URLs naar directe blob-URLs |
| `pnpm regenerate:media-sizes` | Genereer alle afbeeldingsformaten opnieuw |
| `pnpm db:dev:reset` | Reset de Neon dev-branch naar productie |
| `pnpm db:dev:no-expiry` | Zet de Neon dev-branch op geen vervaldatum |
| `pnpm test` | Voer alle tests uit (integration + e2e) |
| `pnpm test:int` | Voer integratietests uit (Vitest) |
| `pnpm test:e2e` | Voer e2e-tests uit (Playwright) |

## Databases

| Omgeving | Neon branch | Verbinding |
|----------|-------------|-----------|
| Lokaal / dev | `dev` | `.env.local` → `DATABASE_URL` |
| Productie | `production` | Vercel env → `DATABASE_URL` |

## Projectstructuur

```
src/
├── app/
│   ├── (frontend)/          # Publieke frontend routes
│   └── (payload)/           # Payload admin routes
├── collections/             # CMS-collectie configuraties
├── components/              # React componenten
│   ├── team/                # Team-specifieke componenten
│   └── ui/                  # Gedeelde UI-componenten
├── blocks/                  # Lexical editor blocks
├── lib/
│   └── clubdata/            # Club.Dataservice (Sportlink) integratie
├── migrations/              # PostgreSQL migraties
├── scripts/                 # Beheerscripts (seed, media, sync)
└── payload.config.ts        # Hoofd Payload-configuratie
```

## Deployment

Elke push naar `main` triggert automatisch een Vercel-deployment. De build-command is:

```
NODE_ENV=production pnpm build && DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm migrate
```

Migraties draaien tegen de **unpooled** Neon-verbinding (vereist voor DDL-statements).
