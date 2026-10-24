# AGENTS.md — Visionary Eyecare Website

Guidance for AI coding agents working in this repository. Read this fully before making changes.

> **Rule: every time before planning** (creating a plan, todo list or implementation approach), re-read `CLAUDE.md` and `AGENTS.md` in full, even if they were read earlier in the session.

## 1. What this project is

A four-page, mobile-first marketing website for **Visionary Eyecare**, an independent optical outlet at **OUG Parklane, Kuala Lumpur**, plus a private admin panel for the owner. It is delivered by **Aurexis Solution** under the *Aurexis Presence* service.

- Source of truth for scope: `Proposal AUR-PRES-VE-2026-003.pdf` in the project root (ref `AUR-PRES-VE-2026-003`, October 2026, RM1,525, ~7 working days, 2 revision rounds).
- Core idea: the outlet has **2,500+ Google reviews**. The site turns that reputation into **WhatsApp messages and enquiries**. Reviews and a one-tap WhatsApp path must be on every page.
- Proposed outcome: *"A customer who finds Visionary Eyecare online sees thousands of genuine reviews, understands its services and products, and messages the team in one tap."*

### Project objectives (from the proposal)
1. **Show the reputation**: live Google rating, review count and real customer reviews.
2. **Be easy to find**: basic on-page SEO for eyecare searches around **OUG** and **Old Klang Road**.
3. **Turn visits into enquiries**: WhatsApp click-to-chat plus an enquiry form delivered to email.

### In scope
- Pages: **Home**, **About**, **Services & Products** (shipped as "Services & Collections" at `/services`), **Contact**.
- Google reviews: live star rating + total count from the Google Business Profile, auto-refreshed review section, "leave a review" link. Google controls how many reviews are returned and how they may be shown. Rating and count must always display.
- WhatsApp click-to-chat on every page; enquiry form → email.
- Basic on-page SEO + Google Analytics.
- Domain (first year), hosting, SSL; handover walkthrough.
- **Admin panel for the business owner** (added after the proposal; see §10):
  1. View, approve, edit, and delete Google reviews shown on the website.
  2. View and answer enquiries submitted through the website's enquiry form.

> The proposal lists "Blog and admin portal (see our Business Site package)" under *Additional Services → Quoted Separately*, and states that optional services are carried out only after scope, price and delivery impact are approved in writing. The admin panel is now a confirmed requirement, but it changes the commercial scope and the 7-day timeline. Make sure a written change order or updated quote exists. Agents should build it as specified in §10, not treat it as out of scope.

### Out of scope (quote separately, do not build unprompted)
Additional public pages, blog, general-purpose CMS (editing page copy/images), customer accounts, e-commerce/booking engine, social media content. If a request goes beyond the four public pages plus the admin panel in §10, flag it as a change of scope.

## 2. Repository layout

```
visionary-eyecare-main/
├── AGENTS.md · CLAUDE.md          # Agent instructions (this file is the single source of truth)
├── PALETTE.md                     # Full colour palette: tokens, roles, usage rules, contrast (see §5)
├── Proposal AUR-PRES-VE-2026-003.pdf  # Client proposal (scope source of truth, confidential)
├── netlify.toml                   # Netlify build: base=visionary, Node 22, @netlify/plugin-nextjs
├── .claude/
│   ├── agents/*.md                # Reviewer/helper subagents (see §8)
│   └── skills/<name>/SKILL.md     # Skill playbooks (see §8)
├── archive-unused/                # Files moved out of the site (old media, originals, removed code). Not deployed; see its README
├── collection-assests/            # (sic) Client brand images, one folder per brand (originals; web copies live in visionary/public/media/images/brands)
├── raw-assests/                   # (sic) Client-supplied raw material, do not edit
│   ├── Company details.txt        # Phone, hours, brands, history (business facts source)
│   ├── VISIONARY_EYECARE_Logo.pdf
│   └── *Promotion* (png/jpeg/pdf) # Buy 3 Free 1 contact lens promos
└── visionary/                     # The Next.js app (run all commands here)
    ├── app/
    │   ├── (site)/                # Public website: root layout with Banner/Navbar/Footer/WhatsApp + MotionProvider
    │   │   ├── layout.tsx page.tsx not-found.tsx
    │   │   ├── about/ services/   page.tsx
    │   │   └── contact/           page.tsx + actions.ts (submitEnquiry Server Action)
    │   ├── (admin)/               # Owner admin panel: separate root layout (noindex, own chrome)
    │   │   ├── layout.tsx
    │   │   └── admin/ login/ not-found.tsx + (panel)/  ← signed-in pages (layout + dashboard, reviews/, enquiries/, each with actions.ts)
    │   ├── styles/ tokens.css (shared) · site.css (public) · admin-tokens.css (admin design system) · admin.css (panel components/pages)
    │   └── fonts.ts robots.ts global-not-found.tsx
    ├── components/
    │   ├── site/   Banner (announcement strip) Navbar (sticky, centred logo, mobile drawer) Footer (slim navy CTA card with live open status overlapping the top edge, compact one-row footer, small "Designed & developed by Aurexis Solution" credit; on every page) Blocks (all page sections) ContactForm BrandLookbook ServiceMenu ReviewDeck ReviewFocus ExplorePanels FaqAccordion OpenBadge (`OpenStatus`)
    │   ├── media/  Media.tsx (image|video from registry) · BackgroundVideo.tsx
    │   ├── motion/ MotionProvider · Reveal · Stagger
    │   └── admin/  Sidebar TopBar SmoothTabs LoginForm ConfirmButton ReviewEditor WhatsAppReply ConfirmBar MarkOpened ui.tsx (PageHeader, StatusTabs, SearchBar, Badge, Avatar, Stars, GoogleStatus, EmptyState)
    ├── lib/
    │   ├── site.ts       # Business facts + link builders (SINGLE SOURCE)
    │   ├── media.ts      # MEDIA REGISTRY — add/swap pictures & videos here only
    │   ├── motion.ts     # motionTokens + springs (never hardcode animation values)
    │   ├── types.ts      # Review, Enquiry, statuses, ActionState, enquiryInterests
    │   ├── phone.ts validation.ts format.ts labels.ts reply-templates.ts notify.ts
    │   ├── auth/ index.ts (getSession/requireAdmin/signIn/signOut) + mock.ts (HMAC cookie, env creds)
    │   └── data/ index.ts (DATA_SOURCE switch) · repos.ts (interfaces) · mock/ (in-memory store + demo seed)
    ├── proxy.ts                 # Optimistic /admin redirect (Next 16 name for middleware)
    ├── public/images/           # Existing assets; NEW media goes in public/media/images|videos
    ├── public/manus-routes.json # Route manifest from the original generator
    ├── .env.example             # DATA_SOURCE, ADMIN_DEMO_*, SESSION_SECRET, ALLOWED_ACTION_ORIGINS, future SUPABASE_*
    ├── TODO.md · README.md      # Open work tracker · developer quick start
    └── tsconfig.json            # @/* alias → visionary/
```

## 3. Tech stack

- **Next.js 16.4 (App Router, Turbopack dev)**, **React 19**, **TypeScript 5.5 (strict)**, Node **22** (`.nvmrc`; `engines` requires ≥20.9).
- Styling: **plain global CSS** in `app/styles/` (`tokens.css`, `site.css`, `admin-tokens.css`, `admin.css`). No Tailwind, CSS modules, or UI library.
- Fonts: `next/font/google` (`app/fonts.ts`), with **Cormorant Garamond** (display, `--font-display`) and **Manrope** (sans, `--font-sans`).
- Images: `next/image` for photos via `<Media>` (logos use plain `<img>` with SVG).
- **`motion` 14.1.0** (`motion/react` only, pinned exact) for animations, via the wrappers in `components/motion/` + tokens in `lib/motion.ts`. CSS transitions/scroll reveals still exist; keep honouring `prefers-reduced-motion`.
- **`server-only`** guards the data/auth modules.
- **`nodemailer` 10.1.1** (pinned) sends enquiry emails over Gmail SMTP (`lib/notify.ts`, server only).
- **No database yet.** `lib/data` is a repository layer: `DATA_SOURCE=mock` (default) uses an in-memory store with clearly-labelled DEMO seed; `DATA_SOURCE=supabase` (Phase B) will implement the same interfaces. **UI code must never import the mock directly — go through `lib/data`.**
- **Mock auth:** `lib/auth` exposes `requireAdmin()`/signIn/signOut backed by an HMAC-signed cookie. Login is rate-limited per IP (in memory). Phase B swaps internals to Supabase Auth; callers stay the same.
- **Hosting:** Netlify (`netlify.toml` at the root, `@netlify/plugin-nextjs`). Database/auth: Supabase in Phase B.

> **Important:** this Next.js version has breaking changes compared with older releases. Before writing Next.js-specific code (metadata, route handlers, `sitemap.ts`/`robots.ts`, caching, Server Actions, `next/image` config), read the relevant guide in `visionary/node_modules/next/dist/docs/` (run `npm install` first). In particular see `01-app/02-guides/upgrading/version-16.md`. Heed deprecation notices.

## 4. Commands

Run from `visionary/`:

| Task | Command |
|---|---|
| Install | `npm install` (required first: `node_modules/` is not committed) |
| Dev server (Turbopack) | `npm run dev` → http://localhost:3000 |
| Type-check | `npx tsc --noEmit` |
| Production build | `npm run build` then `npm start` |
| Admin panel | http://localhost:3000/admin — dev login `owner@visionary.local` / `visionary-demo` (override via `.env.local`, see `.env.example`) |
| Lint | **Broken.** `npm run lint` calls `next lint`, which was removed in Next 16. Do not rely on it. If linting is needed, propose adding ESLint (flat config) to the user first. |

**Verification before finishing any change:** `npx tsc --noEmit` and `npm run build` must succeed. For UI changes, check the dev server at mobile (~375px) and desktop widths. For admin changes, verify logged-out requests to every admin page/action are rejected server-side.

There is no test suite; do not add test frameworks unless asked. Git was initialised on 2026-10-22 (branch `main`). The root `.gitignore` excludes `.env*`, the proposal PDF, `reviews-import/`, `archive-unused/`, `raw-assests/` and `collection-assests/`; keep it that way. Preview deploys set `SITE_NOINDEX=true` (robots disallow all + `X-Robots-Tag: noindex`, see `next.config.mjs`); never set it on production.

## 5. Design system (as actually implemented)

Public-site tokens live in `:root` in `app/styles/tokens.css`. **Reuse them; do not hardcode new hex values.**

**Colour palette:** the client's brand colours are **deep navy** and **crimson**. The full palette (public + admin), each colour's role, usage rules, colours to avoid and WCAG contrast results are in **`PALETTE.md`**. Read it before any colour work. Summary: warm ivory/paper base (~60%), navy/midnight (~25%), crimson for actions only (~8%), a muted **brass/champagne** supporting accent for quality details such as stars, dividers, small icons and exclusive tags (~5%), and a success green for status only. `--brass`, `--brass-deep`, `--brass-line` and `--champagne-soft` are live in `tokens.css`; champagne/success/crimson-tint are still planned (see `visionary/TODO.md`).

| Token | Value | Use |
|---|---|---|
| `--midnight` | `#061230` | Hero/footer backgrounds |
| `--navy` / `--navy-2` | `#0a1f4f` / `#12306b` | Primary dark, `.btn-navy` |
| `--crimson` / `--crimson-dark` | `#c8102e` / `#a30d25` | Brand accent, primary CTA `.btn-crimson`, labels, `<em>` in headings |
| `--crimson-soft` | `#f0697a` | Crimson text/accents on dark backgrounds, focus ring |
| `--ivory` / `--paper` | `#f6f3ec` / `#fcfbf8` | Light surfaces |
| `--ink` / `--stone` | `#0b1a38` / `#5c6779` | Body text / muted text |
| `--hair` / `--hair-light` | 12% ink / 16% white | Hairline borders on light / dark |
| `--display` / `--sans` | Cormorant Garamond / Manrope stacks | Headings / body |
| `--ease` | `cubic-bezier(.22,.61,.36,1)` | All transitions |
| `--pad` | `clamp(20px, 6vw, 96px)` | Horizontal section padding |
| `--brass` / `--brass-deep` / `--brass-line` | `#c9a96a` / `#8a6a2c` / `#b08d4f` | Gold on dark / gold text or active indicators on light / decorative strokes only (see `PALETTE.md`) |
| `--champagne-soft` (live) / *planned* `--champagne` | `#efe4cf` / `#e4cfa6` | Warm beige section background, pale fills / selected states (matches admin `--ad-beige`) |
| *Planned* `--crimson-tint` / `--success` | `#f2c9cf` / `#1f7a4d` | `.label-light` on dark / success status only |

Conventions:
- Look: editorial, boutique optical clinic. Large serif headlines, and the accent phrase goes in `<em>` (italic crimson), e.g. `Good vision changes <em>the whole day.</em>`.
- Small uppercase tracked section labels via `<Label>` (`.label`, `.label-light` on dark).
- Buttons: `.btn` + `.btn-crimson` (primary), `.btn-navy`, `.btn-glass` (on imagery), `.btn-sm`; text links `.btn-text`.
- Sections: `.section` for vertical rhythm; heading layouts `.center-head` / `.split-head`.
- Site chrome: a midnight `Banner` (live open status, promo in brass serif italic, "OUG Parklane, KL" Google Maps link) scrolls away; the paper `Navbar` below it is `position: sticky`: four stone text links on the left (brass underline marks the active page only; hover is a colour change), centred logo, phone + flat crimson "Book an Eye Test" on the right; ≤1100px it becomes a full-height drawer with Cormorant links (page behind is `inert`, Escape/route change closes it). Heroes start below the chrome (they are no longer overlaid), sized with `--banner-h`/`--nav-h` from `site.css`; `html { scroll-padding-top }` keeps focused/anchored content clear of the sticky bar. A "Skip to content" link targets `<main id="main">` on every page; new pages must keep that id.
- Main layout breakpoints: `1180px`, `1100px` (navbar → drawer), `980px`, `640px` (max-width). Keep mobile-first behaviour working.
- Motion: restrained reveals and hover lifts (CSS + `motion/react` wrappers). Transform/opacity only. Always respect `prefers-reduced-motion`. One documented exception: the home hero's one-off "Into focus" intro animates a CSS mask through registered custom properties (`--lx/--ly/--lr`); its settle point is `--fx/--fy` on `.hero` (update when the hero photo changes). Second exception: the home Explore panels widen via `flex-grow` on mouse hover only. Third: the home eye chart and the About hero lenses animate `filter: blur` (chart once per line via `animation-timeline: view()`; About lenses once on load) (CSS `animation-timeline: view()`, progressive enhancement, off under reduced motion). The public site hides the page scrollbar (client request).
- Focus ring: the global `:focus-visible` outline is `--crimson-dark` (light surfaces). Every dark section must override it to `--ivory` or `--crimson-soft` (`.hero`, `.banner`, `.footer`, `.sv`, `.cv`, …); add the override when you build a new dark section.
- Colour rules (details in `PALETTE.md`): crimson = action, brass = detail; one accent leads per section; crimson text never on navy (use `--crimson-soft`); brass never as a large fill; keep neutrals warm; no bright yellow, teal/cyan, purple or gradient text.

### Design Context

Used by the design skills in `.claude/skills/` (`frontend-design`, `audit`, `critique`, `polish`, `normalize`, …). Do not run `teach-impeccable` to replace it; update this section instead.

**Users.** Local customers around OUG Parklane and Old Klang Road, mostly on phones, who found the outlet on Google and are deciding whether to trust it with an eye test, glasses or contact lenses. Their job: check reputation, understand what is offered, then message the team in one tap. Second audience: the shop owner/staff using `/admin` to approve reviews and answer enquiries quickly.

**Brand personality.** Trustworthy, warm, clinical-but-boutique. Direct, reassuring, locally grounded (see §6 voice). Emotional goal: "these people know eyes and will look after me", never "hard sell".

**Aesthetic direction.** Public site: editorial boutique optical clinic — navy/midnight + crimson accent on ivory/paper, with a muted brass/champagne detail accent (`PALETTE.md`), large Cormorant serif headlines with italic crimson accent phrases, Manrope body, generous whitespace, real product/campaign photography. Admin: "Midnight Atelier" (see §7), calm and functional. Anti-references: generic SaaS landing pages, gradient text, neon/glow effects, bright yellow (navy + red + yellow reads as the national flag), teal/cyan clinic palettes, stock "AI slop" card grids, hype copy, discount-store visuals (the shop is premium **and** affordable, so avoid looking cheap or exclusive-only).

**Design principles.**
1. Reputation first: the Google rating/count and real reviews are visible and honest on every page.
2. One tap to act: a WhatsApp path is always within reach; no dead ends.
3. Mobile-first and fast: phones on mobile data are the default context.
4. Restraint: crimson as the one action colour, brass only for small details, one display face, motion that supports reading rather than decorating.
5. Truthful content only: no invented facts, numbers, reviews or people.

## 6. Business facts & content rules

All business data lives in **`lib/site.ts`**. Change facts there, never inline in components. Confirmed facts (source: `raw-assests/Company details.txt`):

- Team has **20 years** optical experience; **in-house optometrist and optician**. **The owner does not want staff faces on the website** (confirmed): no team portraits or photos showing faces; present the team by role (Optometrist, Optician), with hands-only/detail shots at most. The outlet's "6 years at OUG Parklane" is true but the owner asked for it NOT to appear on the website: do not display it. Lead with the 20 years.
- Phone / WhatsApp: **012-948 9141** (`tel: +60129489141`, `wa.me/60129489141`).
- Hours: **Mon–Sat 10:00am–8:30pm**, **Sun 10:30am–6:00pm**.
- **16 frame & sunglass brands** (ARMANI EXCHANGE added 22 Oct 2026): AKONI, PROJEKT PRODUKT, MOVITRA, RAY-BAN, ARMANI EXCHANGE, TOMMY HILFIGER, OAKLEY, FILA, AGNÈS B., NEW BALANCE, P+US, GUY LAROCHE, CARPE DIEM, HUMARS, MASARATA, MASUNAGA.
- **Exclusive in the area**: AKONI, PROJEKT PRODUKT, MOVITRA. Each shows three frames (optical + sunglasses) on the Services page (`exclusiveFrames` in `lib/site.ts`).
- **Tokai prescription lenses** (confirmed 22 Oct 2026): the shop specialises in Tokai prescription lenses, made to order and imported directly from Japan. Say "specialise in"; never "authorised/official dealer" unless confirmed.
- **Lens edging** (confirmed 22 Oct 2026): cutting, shaping and finishing lenses to fit the frame, done in 30 minutes. Keep this claim separate from Tokai (Tokai lenses are ordered from Japan, so never imply they are ready in 30 minutes).
- Brand counts are derived from `brands.length` everywhere in code; only `public/llms.txt` states the number by hand.
- **Contact lens brands** (client list, 22 Oct 2026): Alcon, CooperVision, Johnson & Johnson, Bausch + Lomb, Bionics, Manxion, FreshLady (`contactLensBrands`); shown as a midnight name loop (`LensStrip`) on Services just before the promotion.
- Promotion: **Buy 3 boxes, Free 1** on Bionics Color Touch, Manxion and FreshLady contact lenses. It is temporary: set `promo.active = false` in `lib/site.ts` to remove the section, links, FAQ entry and badge. No end date is known: never invent one.
- Frames: the shop also carries **affordable frames, some under RM100** (confirmed by the owner). Keep the "premium AND affordable" message in the Collection and Services FAQ so customers don't assume it is expensive-only.
- Google Business Profile (manager access confirmed 21 Oct 2026): listed as "Visionary Eyecare Oug Parklane", category Optometrist, **5.0 from 2,509 reviews** (snapshot in `googleProfile` in `lib/site.ts`; refresh it on every review import). Never compute the rating from the reviews shown on the site.
- Address (from the profile): **D3-0-27, OUG Parklane, Jalan 1/152, 58200 Kuala Lumpur** (`address` in `lib/site.ts`).
- Social: Instagram @visionaryeyecarepuchong. The Facebook/Instagram pages say "Puchong" and "since 2020": don't copy either onto the site (the years at OUG must not be shown; lead with 20 years' experience).

Rules:
- **Never invent facts** (reviews, ratings, names, prices, certifications, addresses, staff names). If something is unconfirmed, use a clearly marked placeholder and add it to `visionary/TODO.md`.
- The address printed in the proposal PDF header (Sungai Petani, Kedah) is **Aurexis Solution's** address, **not** the client's. The client's street address is confirmed from the Business Profile (see above).
- The FreshLady promo PDF in `raw-assests/` is branded "Apple Vision". Do not copy third-party branding onto the site.
- Use Malaysian context: `+60` numbers, "RM", British spelling ("colour", "centre", "enquiry").

### Brand voice
Direct, reassuring, warm and locally grounded. Short sentences. Clinical credibility without jargon. Avoid hype and generic AI copy ("unlock", "elevate", "seamless", "in today's world"). Examples already on the site:
- "Good vision changes the whole day."
- "We look for the cause, not just a stronger lens."
- "Clinical care, a boutique eye."

## 7. Code conventions

- **Server Components by default.** Add `'use client'` only when you need state, effects or browser APIs. Current client components: `Navbar`, `ContactForm`, `CollectionCarousel`, `FaqAccordion`, `OpenBadge` (also exports `useOpenStatus`/`OpenStatus`, used inside the server `Banner`), `ExplorePanels`, `ReviewDeck`, `ReviewFocus`, `ServiceMenu`, `BrandLookbook`, `SwipeList`, `BackgroundVideo`, the `components/motion/*` wrappers, and the interactive admin components (`Sidebar`, `TopBar`, `SmoothTabs`, `LoginForm`, `ConfirmButton`, `ConfirmBar`, `ReviewEditor`, `WhatsAppReply`, `MarkOpened`).
- Reuse section components from `components/site/Blocks.tsx` and compose pages from them. Extend existing components before creating new ones.
- WhatsApp links: always build them with `whatsappLink(text)` / `enquiryLink` / `bookingLink` / `brandLink` from `lib/site.ts`, with a context-specific prefilled message.
- External links: `target="_blank" rel="noreferrer"`.
- Images: `<Media>` (wrapping `next/image`) with meaningful `alt`, or `alt=""` for decorative backgrounds. Provide `sizes`, and use `priority` only on above-the-fold heroes.
- Accessibility baseline: one `<h1>` per page, logical heading order, labelled form fields, visible `:focus-visible`, ≥44px touch targets, `aria-label` on icon-only links, `aria-hidden` on decorative SVG/duplicated marquee content.
- Single quotes, 2-space indent, named exports for blocks, default exports for pages/route components. Match the existing compact style.
- Do not add dependencies without asking. Prefer platform/Next.js built-ins. If a dependency is approved, choose a version published at least 7 days ago and pin it exactly.
- Never commit secrets. Keys (Google Business Profile API, GA ID, email provider, Supabase, session secret) go in `.env.local` (git-ignored via `.env*`) and are read server-side only. Only `NEXT_PUBLIC_*` values (e.g. the GA ID, Supabase URL/anon key) may reach the browser.
- Admin panel code: keep data access in `lib/data` and auth in `lib/auth` (both `server-only`). Mutations go through the `actions.ts` Server Actions that call `requireAdmin()` first, validate input, then `revalidatePath`. Style admin UI only with the `--ad-*` tokens in `styles/admin-tokens.css` (listed in `PALETTE.md` §3) and the component classes in `styles/admin.css` (no raw hex in components).
- **Admin design system ("Midnight Atelier", dark + warm):** deep midnight is the foundation only; keep blue lighting minimal. Warm beige/ivory (`--ad-beige`, `--ad-glow`) marks active/selected states, tints glass surfaces and avatars, and appears as one paper-style KPI card; crimson is for primary actions, unread dots, the hero KPI glow and small accents; gold/green only for warning/success. Three surface tiers: solid navy (`--ad-s1`), ivory-tinted glass (`--ad-glass`), raised/illuminated (hero KPI only). Radii 8/14/20 (no pill buttons/tabs/badges). Cormorant is for page titles, hero KPI figures and review quotes only; everything else is Manrope. Crimson text on navy fails contrast, so use `--ad-crimson-text` for text and crimson only as a fill behind white text. Limit `backdrop-filter` to the sidebar, top bar and floating bulk bar. No charts or metrics without real data behind them. Google status must use `<GoogleStatus>`: never show "Connected" in demo mode or without a successful sync.
- **Media rule:** never write a raw `<img>`/`next/image`/`<video>` with a hardcoded path for content media — add an entry to `lib/media.ts` and render `<Media id="…">`. Decorative inline SVGs are fine.
- **Motion rule:** never import `framer-motion`; use `motion/react` via `components/motion` wrappers and values from `lib/motion.ts`. Every motion file needs `'use client'`. Animate transform/opacity only.
- **Data rule:** pages/components read data via `lib/data` (`reviews`, `enquiries`, `stats`) — never import from `lib/data/mock` or a future `lib/data/supabase` outside those folders.
- **Status labels:** owner-facing names live in `lib/labels.ts` (e.g. `awaiting_reply` = "Not yet replied"); use them, not raw enum values, in UI.

## 8. Skills & agents (`.claude/`)

Project-level Claude Code skills and subagents, curated from the NXtte and Aurexis libraries for this stack. Read the matching `SKILL.md` before starting that kind of work.

### Skills (`.claude/skills/<name>/SKILL.md`)

| Work | Skills | Project-specific notes |
|---|---|---|
| SEO | `seo` | Per-page `metadata`, titles 50–60 chars, descriptions 120–160, `sitemap.ts`, `robots.ts`, `Optician`/`LocalBusiness` JSON-LD on Home, `FAQPage` only where FAQ content truly appears. Target local intent: "optical shop OUG", "eye test Old Klang Road". |
| Accessibility | `accessibility`, `frontend-a11y` | Any change to forms, nav/menu, FAQ accordion, buttons, images. WCAG 2.2 AA. |
| React / Next.js | `react-patterns`, `frontend-patterns`, `react-performance`, `nextjs-turbopack`, `documentation-lookup` | Server/client boundaries, form actions, data fetching. Prefer the bundled Next 16 docs (§3) and Context7 over memory. |
| Motion | `motion-foundations`, `motion-patterns`, `motion-advanced` | Must use the existing `lib/motion.ts` tokens and `components/motion` wrappers; reduced motion always honoured. |
| Colour | `design-system`, `normalize`, `accessibility` | Follow `PALETTE.md`; add a token before using any new colour, update `PALETTE.md` in the same change, and verify contrast. |
| UI design & polish | `frontend-design`, `make-interfaces-feel-better`, `design-system`, `audit`, `critique`, `polish`, `normalize`, `arrange`, `typeset`, `adapt`, `harden`, `clarify`, `optimize`, `distill`, `extract`, `animate`, `quieter` | Work **within** the design system in §5 and §7 and the Design Context in §5. Do not restyle the brand. `teach-impeccable` is only needed if the Design Context is removed. |
| Copy & conversion | `copywriting`, `copy-editing`, `brand-voice`, `cro` | Follow §6 voice and fact rules; never invent claims, prices or reviews. |
| Analytics | `analytics` | GA4 on the public site only (never `/admin`); events for WhatsApp clicks, `tel:` clicks, directions and enquiry submissions. |
| Backend / data (Phase B) | `backend-patterns`, `api-design`, `database-migrations`, `postgres-patterns`, `security-review`, `error-handling` | Supabase per §12: migrations only, RLS on, indexes on `(status, created_at)`, no `SELECT *` on personal data, secret-protected cron route. |
| Launch & QA | `deployment-patterns`, `production-audit`, `canary-watch`, `browser-qa`, `click-path-audit` | Netlify deploy, env/secrets, post-deploy smoke checks of the 4 public routes plus admin login. |
| Process | `systematic-debugging`, `verification-before-completion`, `verification-loop`, `receiving-code-review`, `dispatching-parallel-agents`, `coding-standards` | Evidence before "done": run the checks in §4. |

### Agents (`.claude/agents/*.md`)

| Agent | Use it for |
|---|---|
| `react-reviewer` | **Every `.tsx` change** (hooks, server/client boundaries, a11y, security). Mandatory for admin code: no admin data or secrets in client components. |
| `a11y-architect` | **Every UI change** — WCAG 2.2 AA review. |
| `seo-specialist` | SEO audits (output format `[SEVERITY] / Location / Issue / Fix`). |
| `performance-optimizer` | Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1), image weight, bundle size. Customers browse on phones. |
| `security-reviewer` | Auth, Server Actions, enquiry form, cron route, env/secrets, anything touching personal data (PDPA). |
| `typescript-reviewer`, `code-reviewer` | General review of `.ts` logic (`lib/`, actions) before finishing. |
| `database-reviewer` | Supabase schema, migrations, RLS and queries (Phase B). |
| `silent-failure-hunter` | Enquiry save/notify paths, sync job, any `try/catch` — the visitor must never see "sent" if the save failed. |
| `type-design-analyzer` | Changes to `lib/types.ts` / `lib/data/repos.ts` interfaces. |
| `build-error-resolver`, `react-build-resolver` | `tsc` or `next build` failures. |
| `planner`, `architect` | Multi-step features (e.g. Phase B) before implementation. |
| `code-explorer`, `docs-lookup` | Tracing existing code paths; fetching current library docs. |
| `code-simplifier`, `refactor-cleaner` | Cleanup after a feature is working; never change behaviour or public signatures. |

## 9. Current status & open work

**Page map (each section lives on ONE page only; never repeat a section, image or FAQ question across pages):**
- **Home:** Hero ("Into focus": blurred photo → brass lens sharpens it → full focus; copy + proof row of Google review count, 20+ years, 15 brands; fills one screen with the banner/navbar), BrandStrip (thin ivory band, slow looping marquee of all 15 brands; pauses on hover/tap/focus, no visible pause button by client choice; exclusives marked ✦ in brass), Contrast (problem → answer: symptom list beside the eye-exam photo with an overlapping navy "Visionary approach" panel), WhatWeDo ("Read the chart": the first 4 `services` set as an optometrist's eye chart with shrinking lines and acuity notation 6/60–6/9, a crimson rule, and the 6/6 fine-print line "premium and affordable, some under RM100"; lines blur into focus via CSS scroll-driven animation), Explore (`ExplorePanels.tsx`: full-bleed three-way photo split linking About/Services/Contact, no heading band; navy curtain wipe on entry, scroll drift, hovered panel widens on desktop; stacks on phones), ReviewWall (rotating navy "Reviews on Google" seal around the count + `ReviewDeck.tsx`: a fanned stack of large review cards; Next/Previous or swipe lifts the top card off and tucks it behind; never auto-advances; "Read all on Google" + "Leave us a review" links), FAQ (`faqs.home`, 6 questions; all pages share the chat-style FAQ in `FaqAccordion.tsx`: question chips left, a navy-headed chat window right where the question "sends", a typing indicator shows, then the team's answer with a "Continue on WhatsApp" link prefilled with that question; every answer is in the HTML, inactive ones `hidden`). The closing call to action now lives in the shared Footer.
- **About:** `AboutHero` "Through our lenses" (fills one screen): the real shop interior blurred as the background, brass spectacle rims (the logo's two rings) draw in, and the real interior + logo-wall photos come into focus inside the lenses; headline + 3 facts below. AI shop video was tried and dropped (it garbled the logo). Then `AboutStory` (ivory: story, the two roles Optometrist/Optician as plain text (no faces), motto, beside a collage of the real glass entrance and storefront sign; the sign crop stops above the shop's promo banner). Then `AboutWhy` (paper: photo-led fact grid — AKONI campaign tile for the 3 exclusives, navy "Optometrist & optician" tile, ivory "20+ years" tile, frames photo "Some under RM100"), `AboutVisit` (midnight: 4 photo panels for the visit steps with role tags, swipeable row on phones; photos are Gemini AI stand-ins until real shop photos arrive). Earlier two dark "visit journey" designs (cards + timeline, optical ray diagram) were rejected as looking generated; don't bring back icon/line-diagram sections here; keep these sections photo-led. `AboutReviews` (paper: "In their own words." + Google count/links beside `ReviewFocus.tsx`, one large quote at a time; Prev/Next or swipe blurs it out and brings the next into focus; never auto-advances; starts at the 4th live review), FAQ (`faqs.about`).
- **Services & Collections** (`/services`): `ServicesHero` (fills one screen: an ivory moodboard wall of 12 real brand campaign photos (the brand folders' second shots, `wall*` keys; none repeat the carousel) in 5 drifting columns (3 on phones), with a paper headline panel "Clinical care, a boutique eye." and buttons to `#services` / `#collection`; columns rise in once on load and drift apart as the hero scrolls away; a lens-follow version was rejected), `#services` menu (`ServiceMenu.tsx`: fills one screen on desktop; the 7 services (Lens Edging is 05) as large serif rows each with a prefilled WhatsApp button, beside a full-height photo that crossfades to the hovered/focused service and shows its description + tag; every row is an anchor like `#contact-lenses`; phones get a swipeable strip of photo cards; photos are stock placeholders), the collection as three one-screen sections: `CollectionExclusive` (`#collection`, warm beige `--champagne-soft`, contrasting the navy lookbook below: the 3 area exclusives as cards: campaign photo with an "Exclusive" badge and the brand name, then three frame tiles (Optical/Sunglasses; drawn outlines until product photos arrive), then an "Ask about …" WhatsApp link stretched over the card; a swipe row on touch phones; an editorial collage version was tried and rejected), `CollectionBrands` (navy lookbook, `BrandLookbook.tsx`: "Thirteen more labels, one look at a time." (count is derived); one label fills the stage, its photo sharp in a brass-framed panel and blurred across the whole section, name set huge with "07 / 12" and an Ask-on-WhatsApp link; a filmstrip of all 12 thumbnails + arrows/keys/swipe change it with a blur-to-focus transition; never auto-advances; only current ±1 photos are mounted; `CollectionCarousel.tsx` is now unused), `CollectionBudget` (`#budget`, paper, fills one screen: copy "Premium labels, everyday prices too." + WhatsApp + "Tell us your budget…" beside the real affordable-frames photo in a brass-lined frame; a hanging price-tag version was tried and rejected) that swings in on scroll (scroll-driven, reduced-motion safe) and sways on hover), `ServicesReviews` (compact navy band: heading "2,500+ reviews on Google" with Read all / Leave a review links, then three short quotes side by side with brass top rules; swipe row on touch phones; count/rating always from Google, rating only once real; a full-screen giant-number version was rejected as too big), FAQ (`faqs.services`), `LensStrip` (midnight loop of the 7 contact lens brands, scrolling the opposite way to Home's BrandStrip; no promo marks, by client request), Promotions last (`promo.active`; "The Lens Edit", `#promotions`, paper, fills one screen: left column with headline "Buy 3 boxes, get 1 free.", a typographic "3 + 1" (crimson 1, FREE stamp), three steps and the eligibility note; right, three tall photo cards of the real lens displays (shade count, brand, Ask on WhatsApp; photos aria-hidden); swipe row on touch phones).
- **Contact:** `ContactHero` (fills one screen: the live Google map embed, oversized, inverted/tinted navy, non-interactive and aria-hidden, centred on the shop at ~66% with a crimson ping ring; a paper card with h1 "Come and see us at OUG Parklane.", live open status, three action rows WhatsApp / Call / Get directions, and both opening-hour rows), enquiry (fills one screen on desktop: one joined card, navy "Write to us" panel with WhatsApp/Call buttons beside a compact restyle of `ContactForm` — letter decorations hidden and interest options shown as pills, all via CSS scoped to `.enquiry`; the form's markup and validation are unchanged), `ContactVisit` (navy: real interior photo + eye-test-room polaroid beside "Glasses look different on your face. Come and see.", one Google review and the Google count), FAQ (`faqs.contact`). The separate map section and the old ReviewSpotlight card are gone.
- **Leave a review** (`/review`, 5th route, noindex, not in the nav or sitemap; every "Leave us a review" link points here): navy intro with "Review us on Google" (`leaveReviewLink`, recommended) beside the website review form (`ReviewForm.tsx`: stars, review, name, private phone, PDPA consent → `submitWebsiteReview` → Pending in the admin; thank-you offers Google too). New scope: include it in the admin change order.
- Nav is 4 links: Home · About · Services & Collections · Contact. `PageHero` and `ReviewSpotlight` are now unused; `FAQ` is reused with different data per page; each page uses its own photos (see `lib/media.ts`).

Done: 4 public routes, shared Header/Footer, floating WhatsApp, services/brands/promotions/FAQ content from real business data, responsive CSS, global metadata; admin panel frontend (login, dashboard, reviews moderation, enquiries inbox with WhatsApp replies) on the mock layer; media registry + motion system; enquiry form with validation, PDPA consent, honeypot and rate limit stores submissions; `robots.ts` disallows `/admin`; Netlify build config.

Gaps vs. the proposal deliverables (tracked in `visionary/TODO.md`; mostly Phase B, §12):
1. **Google reviews are DEMO data.** Only `live` reviews show publicly; the rating is hidden until the real value is available. Needs Google Business Profile sync (§12.5) + a real "leave a review" link (`reviewsLink` is a generic Google search URL).
2. **Enquiry email is built but switched off by the client** (`emailEnquiries = false`); enquiries are saved and read in the admin. The proposal's "enquiry form → email" was waived by the client on 24 Oct 2026.
3. **Admin runs on mock data + mock auth.** Swap to Supabase data/Auth per §12; remove demo seed + banner; set real env vars.
4. **Google Analytics not installed.** Track WhatsApp clicks, `tel:` clicks, directions and form submissions as events. Never load analytics on `/admin`.
5. **SEO done in code, domain pending.** Per-page `metadata` (title template `%s | Visionary Eyecare`, canonicals), `app/sitemap.ts`, `robots.ts` sitemap line, generated OG image (`app/(site)/opengraph-image.tsx`), `Optician` JSON-LD on Home and `FAQPage` JSON-LD from the shared `FAQ` block (`JsonLd` helper in Blocks.tsx escapes `<`). All URLs come from `siteUrl` in `lib/site.ts` (`NEXT_PUBLIC_SITE_URL`); set it to the real domain before launch. Don't set `og` overrides per page: a page-level `openGraph` object replaces the inherited OG image. Icons: `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`; raster logo `public/images/logo.png`; `public/llms.txt` summarises confirmed facts for AI answer engines (keep it in sync with `lib/site.ts`).
6. **Unconfirmed placeholders:** email `hello@visionary-eyecare.my` (Footer + Contact page), exact street address & map pin, Google Business Profile URL, team names/photos, production domain. Stock photos in `public/images/photos/` may need replacing with real outlet photography/video. Brand photos for ARMANI EXCHANGE, HUMARS and CARPE DIEM were supplied 22 Oct 2026 (the HUMARS/CARPE DIEM shots show price stickers RM598/RM599, kept by client choice).
7. **Lint script broken** (see §4).
8. **Palette not fully tokenised.** Brass tokens are live; champagne/success/crimson-tint tokens are still planned; several golds are hardcoded in `site.css`/`admin.css`; a few text colours fail WCAG AA (contact-form selected chip, admin light theme). See `PALETTE.md` §5.
9. ~~`.gitignore` did not cover the proposal PDF.~~ Fixed (`*AUR-PRES-VE-2026*.pdf`).

When completing an item, update `visionary/TODO.md`.

## 10. Admin panel (business owner)

A private area at **`/admin`** used only by the Visionary Eyecare owner/staff. It is a separate surface from the public site and has a different job: fast, plain and functional, not editorial.

### 10.1 Users & access
- Only authenticated admins can reach `/admin/**` and admin APIs. Assume a single owner account, with room for a few staff accounts later.
- **Enforce auth on the server in every admin page, Server Action and route handler.** Do not rely only on the redirect in `proxy.ts` (Next 16's name for middleware) or on hiding UI.
- Secure session cookies (`HttpOnly`, `Secure`, `SameSite=Lax`), hashed passwords (or an approved auth provider), login rate-limiting, logout, session expiry.
- `/admin` must be `noindex`, disallowed in `robots.ts`, excluded from `sitemap.ts`, and must never load Google Analytics or show the public Header/Footer/floating WhatsApp. It has its own route group/layout.

### 10.2 Google reviews moderation
Owner can **view, approve, edit and delete** reviews before they appear on the website.

Flow:
1. A server-side **sync job** (scheduled, plus a manual "Sync now" button) pulls reviews from the Google Business Profile (manager access is required per the proposal) and **upserts by Google review ID** into the database.
2. New reviews arrive as **`pending`**. Nothing appears publicly until an admin publishes it.
3. Statuses (`lib/types.ts`): `pending` → `approved` (vetted, not yet on the site) → `live` (shown on the website); `hidden` (not shown, restorable); `removed` (deleted from the site, kept as a tombstone keyed by the Google review ID so the next sync never re-imports it). "Approve & publish" goes straight to `live`.
4. The public Reviews section renders **only `live` reviews**, server-side, ordered by an admin-controlled `featured`/`sortOrder`, then by date.
5. The overall **star rating and total review count always come directly from Google** and are never computed from approved reviews only. Showing an aggregate based on a hand-picked subset would be misleading, and the proposal requires rating and count to always show.

**Editing rules (important, confirmed):** reviews are attributed to real customers and to Google. The admin may edit *website presentation* only: display name format (e.g. "Aina M."), featured flag, sort order, and a website text limited to an **excerpt or light typo fixes** (server rejects text longer than the original +20 chars; UI warns on heavy rewording). The admin must **not** change a reviewer's rating or date, and should not rewrite their words. Keep `originalText` stored unchanged, show "Google review" attribution plus a link to the full reviews. If the owner asks to rewrite review text, flag the issue: it misrepresents customers and can breach Google's terms and consumer-protection rules.

Admin UI: list with filters (status, rating, date), search, bulk approve/hide, a detail view showing the original text, sync status (last run, errors).

### 10.3 Enquiries inbox
Owner can **view and answer** enquiries submitted from the Contact page form.

Flow:
1. Public form submission → server-side validation (name, phone, interest, message, consent; length limits) → spam protection (honeypot + rate limit; CAPTCHA only if approved) → **store in DB** → **email notification** to the business. Show the visitor a real success or failure state. Never claim "sent" if the save failed.
2. Statuses (`lib/types.ts`): `new` (not opened) → `awaiting_reply` ("Not yet replied", set when opened) → `replied` (owner confirmed a reply was sent), plus `archived`. Show the unanswered count in the admin nav.
3. **Answering:** the admin replies via a one-click **WhatsApp** link built from the customer's phone number (confirmed channel, §10.6), then confirms "Mark as replied". Store each reply (text, channel, timestamp, admin) in the enquiry's history.
4. Admin UI: inbox list (newest first, status filter, search by name/phone), detail view with message, contact actions (WhatsApp, call), reply composer and history.

### 10.4 Data & privacy
- Enquiries contain personal data (name, phone). Follow Malaysia's **PDPA 2010**: keep the consent/privacy notice on the form, collect only what is needed, define a retention period (confirm with the user before adding auto-delete), and allow deletion.
- Never expose enquiry data to the public site or client bundles. Admin data is fetched in Server Components / server code only.
- Validate and escape all user input. Render enquiry and review text as plain text, never as HTML. Protect mutations against CSRF (Server Actions include origin checks; verify for any custom route handlers).
- Secrets (DB URL, auth secret, Google API credentials, email API key) live in env vars only.

### 10.5 Suggested data model (adjust after stack decision)
- `reviews`: id, google_review_id (unique), author_name, author_photo_url, rating, original_text, review_date, display_name, display_text, is_edited, status (`pending`/`approved`/`live`/`hidden`/`removed`), featured, sort_order, synced_at, updated_by, updated_at.
- `review_sync_runs`: id, started_at, finished_at, status, imported_count, error.
- `google_profile_stats`: rating, total_review_count, fetched_at (powers the always-on rating and count).
- `enquiries`: id, name, phone, interest, message, status (`new`/`awaiting_reply`/`replied`/`archived`), created_at, opened_at, replied_at, ip_hash/user_agent (spam control only).
- `enquiry_replies`: id, enquiry_id, body, channel (`whatsapp`), logged_at, confirmed, admin_id.
- `admins`: id, email, password_hash (or provider id), role, created_at; plus sessions if self-managed.

### 10.6 Decisions (confirmed by the user)
1. **Database: Supabase** (Postgres + Auth) — Phase B, see §12. Frontend built first on the mock layer. Hosting: Netlify.
2. **Auth:** Supabase Auth email/password for a single owner account (mock env-login until then).
3. **Enquiry email: OFF by client choice (24 Oct 2026)**; enquiries are read in the admin inbox. `emailEnquiries` in `lib/site.ts` switches it (and the consent wording). The dormant setup: **Email provider / recipient (22 Oct 2026, user chose Gmail):** `lib/notify.ts` sends each enquiry from the business Gmail to itself over Gmail SMTP with `nodemailer@10.1.1` (pinned, user-approved). Recipient and sender: `smvisionn81@gmail.com` (`email` in `lib/site.ts`, also in the footer). Env: `GMAIL_APP_PASSWORD` (a Google app password; needs 2-Step Verification on the account), optional `GMAIL_USER` / `ENQUIRY_EMAIL_TO`. Never test with a wrong password against the real account (Google may flag it).
4. **Enquiry reply channel: WhatsApp** to the customer's phone number (no email replies for now; the form keeps name/phone/interest/message + PDPA consent).
5. **Review "edit" policy: excerpt + light fixes.** Original text/rating/date immutable; `displayText` may trim or fix typos only (validated: can't be longer than original +20 chars, warned when heavily reworded). See §10.2.
6. **Google Business Profile access:** needed for Phase B sync. Request manager access + API approval early.
7. **Enquiry retention: 2 months** (owner, 22 Oct 2026). `enquiryRetentionMonths` in `lib/site.ts`; `purgeExpiredEnquiries()` (`lib/retention.ts`) deletes older enquiries + replies whenever an enquiry arrives or an admin page loads. Consent text and the admin inbox state it.
8. **Commercial change order** still required for the admin panel (§1).
9. **Phase B started 21 Oct 2026** (user approved Supabase; packages `@supabase/supabase-js@2.117.3`, `@supabase/ssr@0.12.7`, pinned).
10. **Google reviews come in via Google Takeout**, not the API: the manager account exports the Business Profile (verified: all 2,509 reviews with stable review IDs, rating, text, date, owner reply). The owner uploads the export in the admin every ~3 weeks; import upserts by review ID, new ones arrive `pending`, `removed` tombstones are never re-imported, and the rating/count snapshot is refreshed. Exports live in `reviews-import/` (git-ignored, personal data), never in the app.
11. **Website reviews (new, confirmed):** visitors can also leave a review on the site. Form: name, star rating, review text, phone (private, never shown; used only to confirm a real customer), PDPA consent, honeypot + rate limit. Submissions arrive `pending` in the admin. Owner may approve, reject (hide) or delete, with **light edits only** (same rule as Google reviews: name format, trim/typo fixes, original kept). Approved website reviews are **mixed into the existing review sections, clearly labelled "Website review"** vs "Google review". They **never** affect the Google rating or count. After submitting, the thank-you state also offers "Also share it on Google" (`leaveReviewLink`). This is new scope for the admin change order.

### 10.7 As implemented (frontend phase)
- `/admin/login` → session cookie → `/admin` dashboard → `/admin/reviews` (tabs Pending · Approved · Live on website · Hidden · Removed) and `/admin/enquiries` (tabs New · Not Yet Replied · Replied · Archived).
- Shell: slim sidebar + top bar (breadcrumb, demo-data chip, unanswered-enquiry count, admin identity; sign-out also in the top bar on mobile where the sidebar becomes a bottom nav).
- Dashboard: asymmetric KPI composition (hero "New enquiries", "Not yet replied" with oldest unanswered age, "Reviews to approve", wide "Live on website + Google status" strip), then recent enquiries and pending reviews previews. All figures are derived from real repository data.
- Enquiries list: single glass table (Customer · Interest · Message · Status · Received) that stacks on mobile.
- Review detail: read-only original + editable website text/name/order/featured, "Approve & publish" or "Save only". Reviews list has a floating bulk bar that appears (CSS `:has`) only when rows are selected.
- Enquiry detail: one workspace shell, customer side panel (contact actions, Received/Opened/Replied stepper) + conversation thread + docked composer. Opening moves New→Not Yet Replied; quick-reply chips from `lib/reply-templates.ts` open `wa.me` prefilled → **"Did you send it? Mark as replied"** confirm bar; reply history shows as outgoing bubbles; archive/restore.
- Contact form posts to `submitEnquiry` (validate → store → notify stub); new enquiry appears under **New**.
- Mock data resets on server restart and is DEMO ONLY — show the banner, never ship `DATA_SOURCE=mock` to production.

## 11. Recipes (for routine edits)

- **Add/replace a photo:** copy the file to `public/media/images/` → add/replace a key in `lib/media.ts` → use `<Media id="yourKey" sizes="…"/>` where needed. Swapping an existing key needs no component changes.
- **Different photo for phones (art direction):** use a `type: 'art'` registry entry (`wide` + `tall` + `tallWhen` media query); `<Media>` renders a `<picture>` so each device downloads one image. The home hero uses this.
- **Add a video (or hero video):** copy MP4 (H.264, ≤4 MB, ≤15 s for loops) + poster to `public/media/videos/` and `images/` → add a `type:'video'` entry (with `poster`, `alt`, optional `srcWebm`/`captions`, and `once: true` to play once and rest on the last frame instead of looping) to `lib/media.ts` → `<Media id>` renders it automatically (autoplay, muted, poster under reduced motion). Set a hero: change `media=` on `<Hero>`/`<PageHero>`.
- **Animate a section:** wrap it in `<Reveal>` or `<Stagger>`+`<StaggerItem>` (imports from `components/motion`). For custom sequences, write a `'use client'` component with `motion/react` using tokens/springs from `lib/motion.ts`.
- **Add a section to a page:** build it as a named export in `components/site/Blocks.tsx` (or a new file there), then mount it in the page's `<main>`. Keep `.section`, `<Label>`, `h2 + <em>` conventions.
- **Add an enquiry "interest" option:** edit `enquiryInterests` in `lib/types.ts` — the contact form and admin filters pick it up automatically.
- **Add a WhatsApp reply template:** add an entry to `replyTemplates` in `lib/reply-templates.ts` (`{name}` = customer's first name).
- **Change business facts (hours/phone/brands/FAQs):** edit `lib/site.ts` only.
- **End the promotion:** set `promo.active = false` in `lib/site.ts`.
- **New admin page:** create under `app/(admin)/admin/(panel)/` with `await requireAdmin()` at the top; mutations go in a sibling `actions.ts` (each action calls `requireAdmin()`). Add a nav link in `components/admin/Sidebar.tsx`.

## 12. Supabase integration (Phase B — in progress since 21 Oct 2026)

**Built (code complete, waiting for keys):**
- `supabase/migrations/20261021000000_init.sql`: `admins` (allow-list linked to `auth.users`), `reviews` (`source` google|website, unique `google_review_id`, private `phone`, status/featured/sort), `review_import_runs`, `google_profile_stats` (seeded 5.0 · 2,509), `enquiries`, `enquiry_replies`. RLS ON with **no policies** + grants revoked: browsers can never touch tables; all access is server-side.
- `lib/supabase/{env,admin,server}.ts`: `serviceClient()` (service-role, server-only, after validation / `requireAdmin()`), `authClient()` (anon key + cookies for sign-in only).
- `lib/data/supabase/index.ts` implements the same `DataLayer` as the mock; `lib/data/index.ts` picks it when `DATA_SOURCE=supabase` (throws if keys are missing). `listPublic` selects public columns only (never phone or full name).
- `lib/auth`: Supabase Auth email/password + `admins` allow-list (non-admins are signed straight out); `proxy.ts` refreshes the session on `/admin`. Mock login still works when `DATA_SOURCE=mock`.
- Google reviews: `/admin/reviews/import` (`GoogleImport.tsx`): the owner picks the unzipped Takeout `location-…` folder; the browser sends only the review fields; `previewImportAction` / `runImportAction` re-validate (`lib/reviews.ts`), insert new reviews as `pending` (optional: new 5★ → `approved`), never touch existing/removed ones, and refresh `google_profile_stats` from the export (rating over ALL exported reviews, count = all reviews). Star-only reviews are skipped (nothing to quote). Google's "(Translated by Google)" English is prefilled as `display_text`.
- Admin reviews list: source filter (All/Google/Website), 50 per page, "Select all on this page" for bulk approve.
- `npm run admin:add -- email` creates the owner's login (temp password printed once) and adds them to `admins`.

**To switch on:** add the 3 keys + `DATA_SOURCE=supabase` to `.env.local`, run the migration in the Supabase SQL Editor, run `npm run admin:add -- <owner email>`, restart the dev server, import the Takeout folder.

Original plan (for reference):

1. `npm i @supabase/supabase-js @supabase/ssr --save-exact` (verify versions ≥7 days old). Env vars per `.env.example`.
2. `supabase/migrations/` for `reviews`, `review_sync_runs`, `google_profile_stats`, `enquiries`, `enquiry_replies`, `admins` (columns = fields in `lib/types.ts`). Indexes on `(status, created_at)` for reviews & enquiries. **RLS on**: public may only INSERT into `enquiries` and SELECT `status='approved'` reviews; admin role full access.
3. Implement `lib/data/supabase/{index,reviews,enquiries,stats}.ts` against the same `DataLayer` interfaces; add to the switch in `lib/data/index.ts`; set `DATA_SOURCE=supabase`.
4. Replace `lib/auth/mock.ts` internals with Supabase Auth (keep `requireAdmin`/`signIn`/`signOut` exports); use `proxy.ts` to refresh sessions.
5. Google Business Profile sync: scheduled route handler (`/api/cron/sync-reviews`, secret-protected) upserting by `google_review_id`; **never overwrite `display_text`/status; `removed` tombstones block re-import**. Store rating + count in `google_profile_stats`.
6. Wire `lib/notify.ts` to the chosen email provider; add GA to the site layout only.
7. Remove demo seed + `demo-banner`; production checklist: real `SESSION_SECRET`/Supabase env, `DATA_SOURCE=supabase`, real GBP account, Netlify env vars set.
