# SVV'04 Schoonebeek — Website

Website voor voetbalvereniging SVV'04 uit Schoonebeek. Gebouwd met Next.js, Payload CMS en gehost op Cloudflare Workers.

## Tech stack

- **Next.js 16** (App Router) — frontend en server-side rendering
- **Payload CMS 3** — content management (teams, nieuws, pagina's, media, sponsors)
- **PostgreSQL** via [Neon](https://neon.tech) — database
- **Vercel Blob** — media-opslag
- **Resend** — e-mail
- **Cloudflare Workers** (via [OpenNext](https://opennext.js.org/cloudflare)) — hosting, met Hyperdrive, Images, Turnstile en Web Analytics
- **GitHub Actions** — CI/CD (deploy en previews)

## Lokale ontwikkeling

### Vereisten

- Node.js ≥ 22
- pnpm ≥ 12
- Een `.env.local` met de dev-gegevens (zie `.env.example`)

### Setup

```bash
# 1. Clone de repo
git clone <repo-url>
cd site

# 2. Zet de lokale env vars in .env.local (zie .env.example)

# 3. Installeer dependencies
pnpm install

# 4. Start de dev server
pnpm dev
```

Open `http://localhost:3000` voor de frontend en `http://localhost:3000/admin` voor het CMS.

De dev-omgeving gebruikt de **Neon `dev` branch** — gescheiden van productie. Schema-wijzigingen worden automatisch doorgevoerd (dev push, geen migraties nodig).

## Scripts

| Script                  | Beschrijving                                                |
| ----------------------- | ----------------------------------------------------------- |
| `pnpm dev`              | Start dev server                                            |
| `pnpm devsafe`          | Start dev server na schone `.next`-build                    |
| `pnpm build`            | Next.js-build (Turbopack)                                   |
| `pnpm cf:build`         | Build voor Cloudflare (OpenNext, webpack)                   |
| `pnpm cf:preview`       | Cloudflare-build lokaal draaien in workerd                  |
| `pnpm generate`         | Genereer TypeScript types + import map                      |
| `pnpm migrate:create`   | Maak een nieuwe migratie aan (alleen vóór productie-deploy) |
| `pnpm sync:teamcodes`   | Synchroniseer Sportlink teamcodes naar CMS                  |
| `pnpm db:dev:reset`     | Reset de Neon dev-branch naar productie                     |
| `pnpm db:dev:no-expiry` | Zet de Neon dev-branch op geen vervaldatum                  |
| `pnpm test`             | Voer alle tests uit (integration + e2e)                     |
| `pnpm test:int`         | Voer integratietests uit (Vitest)                           |
| `pnpm test:e2e`         | Voer e2e-tests uit (Playwright)                             |

## Databases

| Omgeving     | Neon branch                         | Verbinding                                                                               |
| ------------ | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| Lokaal / dev | `dev`                               | `.env.local` → `DATABASE_URL`                                                            |
| Preview      | `preview/pr-<nummer>` (automatisch) | Secret `DATABASE_URL` van de Worker Preview (gezet door `.github/workflows/preview.yml`) |
| Productie    | `production`                        | Hyperdrive-binding `HYPERDRIVE` van de Worker                                            |

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
├── scripts/                 # Beheerscripts (media, sync)
└── payload.config.ts        # Hoofd Payload-configuratie
```

## Deployment

De site draait op Cloudflare Workers. Zie [docs/cloudflare.md](docs/cloudflare.md) voor de
opbouw, de secrets en de eenmalige setup.

- **Productie**: elke push naar `main` draait `.github/workflows/deploy.yml`: eerst de
  Payload-migraties op productie (via de **unpooled** Neon-verbinding, vereist voor DDL),
  dan de build en de deploy. Die volgorde is nodig omdat de build pagina's prerendert die
  de database bevragen.
- **Previews**: elke PR draait `.github/workflows/preview.yml`: een eigen Neon-branch
  `preview/pr-<nummer>` (kopie van productie), de migraties van de PR daarop, en een Worker
  Preview met een vaste URL die als comment in de PR komt. Bij het sluiten van de PR
  worden de branch en de Preview opgeruimd.

> **Productie-migraties**: bij de eerste deploy met deze migratiegeschiedenis is
> de baseline (`..._baseline_prod_schema`) handmatig als toegepast gemarkeerd in
> `payload_migrations`, omdat de productie-tabellen al bestonden. Nieuwe
> deployments draaien alleen nog niet-toegepaste migraties.
