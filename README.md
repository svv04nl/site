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
| `pnpm seed:audiences` | Seed "Voor jou"-doelgroeppagina's |
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
| Preview | `preview/<git-branch>` (automatisch) | Vercel Preview env → `DATABASE_URL` (geïnjecteerd door Neon-integratie) |
| Productie | `production` | Vercel Production env → `DATABASE_URL` |

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

Elke push naar `main` triggert automatisch een productie-deployment; elke PR een
preview-deployment. De build-command (`vercel.json`) draait `scripts/vercel-build.sh`:
eerst de Payload-migraties tegen de database van **die** omgeving (via de
**unpooled** Neon-verbinding, vereist voor DDL), dáárna de Next.js-build. Die
volgorde is nodig omdat de build routes zoals `/sitemap.xml` statisch
prerendert en die de database bevragen — de tabellen moeten dus al bestaan.

Het script stopt bewust met een foutmelding als `DATABASE_URL_UNPOOLED` ontbreekt —
zo migreert een preview-build nooit per ongeluk tegen een verkeerde database.

### Preview-branches met automatische Neon-branch

Previews krijgen een eigen, geïsoleerde kopie van de productie-database via de
**Neon-Vercel integratie**. Per PR wordt een Neon-branch aangemaakt, de migraties
draaien daar (niet op productie), en bij het sluiten van de PR wordt de branch
opgeruimd.

**Eenmalige setup in de dashboards (kan niet vanuit de repo):**

1. **Neon-integratie koppelen** — Vercel → project → *Integrations* →
   *Neon* (Marketplace) → koppel aan het juiste Neon-project. Kies bij de
   integratie-instellingen: *Create a database branch for each preview deployment*.
2. **Env-scope controleren** — de integratie zet `DATABASE_URL` en
   `DATABASE_URL_UNPOOLED` in de **Preview**-scope. Zorg dat er géén handmatige
   `DATABASE_URL_UNPOOLED` in de Preview-scope staat die naar productie wijst
   (anders wint die en migreer je alsnog op prod). Production- en
   Development-scopes blijven ongewijzigd.
3. **Neon-plan** — automatische branches per preview vereisen voldoende
   branch-quota; op het gratis plan is dat beperkt. Controleer je Neon-plan als
   previews falen op "branch limit reached".

> **Productie-migraties**: bij de eerste deploy met deze migratiegeschiedenis is
> de baseline (`..._baseline_prod_schema`) handmatig als toegepast gemarkeerd in
> `payload_migrations`, omdat de productie-tabellen al bestonden. Nieuwe
> deployments draaien alleen nog niet-toegepaste migraties.
