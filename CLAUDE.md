## ⚠️ VERPLICHT: Git commit & push na elke grote verandering

Na elke afgeronde feature, refactor, bugfix of meerdere gewijzigde bestanden: `git add` + `git commit` + `git push`. Push tussendoor, niet pas aan het einde. Werk dat niet gepusht is gaat verloren tussen sessies.

@AGENTS.md

## Project

Intern dashboard voor Rederij Cascade. Fungeert als:
1. **Hub** — centrale startpagina met links naar alle interne tools
2. **OAuth 2 Provider** — Authorization Code server voor cadeaubon app en personeelsplanner

## Tech Stack

- Next.js 16, TypeScript, Tailwind v4
- Auth.js v5 (next-auth@beta) — email+wachtwoord + Google OAuth
- Prisma + PostgreSQL
- bcryptjs voor wachtwoord hashing
- jose voor JWT (access tokens)

## Auth

- Login via email + wachtwoord (`/login`)
- Auth.js v5 met PrismaAdapter + JWT sessies
- Middleware beschermt alle routes behalve `/login`, `/api/auth/**`, `/api/oauth/**`

## OAuth 2 Server

Endpoints:
- `GET /api/oauth/authorize` — start Authorization Code flow
- `POST /api/oauth/token` — wissel auth code voor access token
- `GET /api/oauth/userinfo` — geeft user info op basis van Bearer token

Clients registreren via `npx tsx scripts/seed-oauth-clients.ts`.

## Scripts

- `npm run db:push` — schema pushen naar DB
- `npm run db:seed` — eerste admin aanmaken
- `npx tsx scripts/seed-oauth-clients.ts` — OAuth clients registreren
- `npm run dev` — lokaal draaien op poort 3001

## Deployment

- Domain: `dashboard.varenbijcascade.com`
- Aparte container op de VPS, los van de personeelsplanner
- Environment vars: DATABASE_URL, AUTH_SECRET, AUTH_URL, AUTH_GOOGLE_ID/SECRET
