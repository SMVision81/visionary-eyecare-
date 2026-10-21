# Visionary Eyecare — website

Four-page website for Visionary Eyecare (OUG Parklane, Kuala Lumpur) with a private admin panel for reviews and enquiries. Built by Aurexis Solution.

Built with Next.js 16 (App Router), React 19, TypeScript and plain CSS. It is hosted on Netlify. Supabase (database and login) is planned for Phase B.

## Run it locally

Requires Node 22 (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # optional in development
npm run dev                  # http://localhost:3000
```

| Task | Command |
|---|---|
| Type-check | `npx tsc --noEmit` |
| Production build | `npm run build` then `npm start` |

`npm run lint` does not work on Next 16 yet.

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/services` | Services & Collections |
| `/contact` | Contact + enquiry form |
| `/admin` | Owner admin panel (sign-in required) |

## Admin panel

Open http://localhost:3000/admin. The development login is `owner@visionary.local` / `visionary-demo`. Set your own login with `ADMIN_DEMO_EMAIL`, `ADMIN_DEMO_PASSWORD` and `SESSION_SECRET` in `.env.local`.

The admin panel currently runs on **demo data** (`DATA_SOURCE=mock`). Demo data resets whenever the server restarts. Do not deploy to production with mock data.

## Where things live

- **Business facts** (phone, hours, brands, FAQs, promotion): `lib/site.ts`
- **Photos and videos:** `lib/media.ts` (files in `public/media/`)
- **Styles:** `app/styles/`. Colour palette and rules: `../PALETTE.md`
- **Data and login:** `lib/data/` and `lib/auth/`

The project rules for developers and AI agents are in `../AGENTS.md`. Open work is listed in `TODO.md`.

## Deploying

Netlify builds the site from `../netlify.toml`, using `visionary` as the base folder and `@netlify/plugin-nextjs`. Set the production environment variables in Netlify before going live. `TODO.md` lists them under "Launch".
