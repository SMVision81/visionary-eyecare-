# TODO — Visionary Eyecare

Open work against proposal `AUR-PRES-VE-2026-003` plus the admin panel. Details and rules live in `../AGENTS.md` (section numbers below refer to it). Tick items off here when done.

## Commercial & access (blocking)

- [ ] Written change order / updated quote for the admin panel (proposal lists "admin portal" as quoted separately) (§1, §10.6.8)
- [x] Manager access to the Google Business Profile (21 Oct 2026). Takeout works with the manager account: the export (in `reviews-import/`, git-ignored, contains personal data) holds all 2,509 reviews (2,495×5★, 13×4★, 1×1★; 2,314 with text; Dec 2020 → Oct 2026), the owner's replies, hours (match the site), lat/lng and 208 profile photos/videos. Format: `reviews-*.json` → `reviews[]` with `name` (stable review ID), `reviewer.displayName`, `starRating` (ONE…FIVE), `comment`, `createTime`, `updateTime`, `reviewReply`
- [ ] Domain access and production domain name
- [ ] Choose email provider and enquiry recipient address (§10.6.3)
- [ ] Confirm enquiry retention period before adding any auto-delete (§10.6.7)

## Client content to confirm (placeholders in use)

- [ ] Business email. `hello@visionary-eyecare.my` is a placeholder in `components/site/Footer.tsx` and `app/(site)/contact/page.tsx`
- [x] Street address confirmed from the Business Profile (D3-0-27, OUG Parklane, Jalan 1/152, 58200 KL): footer, Contact, FAQ, JSON-LD, llms.txt
- [ ] Exact map embed from Google Maps (Share → Embed a map) to replace the search-based `mapsEmbed`
- [x] "Ask for reviews" link → `leaveReviewLink` (https://g.page/r/CZgiPpR9rb7lEBM/review)
- [x] Profile share link → `reviewsLink` (knowledge-panel URL, kgmid /g/11l4mzqmr8); Facebook + Instagram → `socialProfiles` and JSON-LD `sameAs`
- [ ] Update the Google Business Profile's Website button to the new domain at launch (it currently points to facebook.com/visionaryeyecare7)
- [x] Team photos: owner does NOT want faces on the site (roles only)
- [ ] Team names for About: confirm whether the owner wants names shown at all
- [ ] Real outlet photography/video to replace stock photos in `public/images/photos/`
- [ ] Real HUMARS image (`brandHumars` in `lib/media.ts` is a placeholder stock photo)
- [ ] Product photos for the exclusives (AKONI done 22 Oct 2026: 3 sunglasses): 3 frames each still needed for PROJEKT PRODUKT, MOVITRA (optical + sunglasses). Tiles show drawn outlines until then: add the photos to `lib/media.ts` and set `media` (and the real optical/sunglasses mix) in `exclusiveFrames` in `lib/site.ts`
- [ ] ARMANI EXCHANGE photo (`brandArmaniExchange` is a drawn placeholder, `public/media/images/brands/armani-exchange.jpg`)
- [ ] Lens edging photo (`svcEdging` is a drawn placeholder, `public/media/images/svc-lens-edging.jpg`)
- [ ] Better CARPE DIEM image (current source is only 685px wide)
- [ ] Promotion end date, if any. When it ends, set `promo.active = false` in `lib/site.ts`

## SEO (proposal objective 02)

- [x] Page-specific `metadata` for all 4 pages (titles 52–57 chars, descriptions 140–148) + `%s | Visionary Eyecare` template
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain (metadataBase, canonicals, sitemap and robots already read it; falls back to localhost)
- [x] `app/sitemap.ts` covering the 4 public routes; `robots.ts` points to it
- [x] `Optician` JSON-LD on Home (name, phone, hours, area, map link). Add `sameAs` (Google Business Profile URL), exact street address/postcode/geo when confirmed; no `aggregateRating` (self-served reviews are not eligible)
- [x] `FAQPage` JSON-LD emitted by the shared `FAQ` block (every page shows its FAQ)
- [x] Open Graph/social preview image (`app/(site)/opengraph-image.tsx`, generated 1200×630)
- [ ] After launch: submit the sitemap in Google Search Console and verify the domain
- [x] Raster logo (`public/images/logo.png`) in the business JSON-LD, plus `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` (brass glasses on navy)

## Google Analytics (proposal feature)

- [ ] GA4 on the public site layout only (never `/admin`), ID via `NEXT_PUBLIC_*` env var
- [ ] Events: WhatsApp clicks, `tel:` clicks, Get Directions, enquiry form submissions

## Phase B: Supabase, reviews sync, email (§12)

- [x] `@supabase/supabase-js@2.117.3` + `@supabase/ssr@0.12.7` installed (pinned, user-approved)
- [x] Migration written (`supabase/migrations/20261021000000_init.sql`). [ ] Run it in the Supabase SQL Editor
- [x] `lib/data/supabase/*` implementing the `DataLayer` interfaces. [ ] Set the 3 keys + `DATA_SOURCE=supabase` in `.env.local` (and Netlify)
- [x] Supabase Auth + `admins` allow-list behind `requireAdmin`/`signIn`/`signOut`; session refresh in `proxy.ts`. [ ] `npm run admin:add -- <owner email>`; add a password-reset flow later (today: reset in the Supabase dashboard)
- [x] Google reviews via Takeout import page (`/admin/reviews/import`) instead of the API sync: tested with the real export (2,314 imported, 195 star-only skipped, re-import adds 0)
- [x] Website review form (`/review`) → Pending in the admin; labelled "Website review" on the site
- [x] First real import on Supabase (22 Oct 2026, `npm run reviews:import -- … --approve-5`): 2,314 imported (2,300 5★ Approved, 14 Pending), 20 hand-picked reviews put Live
- [ ] Confirm with the owner that staff first names in published reviews are OK (live reviews mention "Ms Meena" and "Jacky"); otherwise take those off in the admin
- [ ] Read the 14 Pending reviews (4★/1★) in the admin and approve or hide them
- [ ] Admin password reset/change flow (today: Supabase dashboard → Authentication → user → Send password recovery). `admin:add` prints a temporary password once
- [ ] Reviews reviewed 21 Oct 2026 (security, database, React, a11y, TypeScript): all confirmed findings fixed (HttpOnly/Secure auth cookies, batched import under the 1 MB action limit, code-point truncation, hardened Takeout parsing, stable pagination, DB range checks + updated_at trigger, audit email on imports/replies, accessible review form/import status)
- [x] Google rating + count shown from the profile snapshot (`googleProfile`: 5.0 · 2,509, 21 Oct 2026). Update on every import until the sync writes them
- [ ] Home is statically prerendered, so the hero/review counts freeze at build time: add `revalidate` on Home or call `revalidatePath('/')` from the sync job
- [ ] Wire `lib/notify.ts` to the email provider (enquiry → email, as the proposal promises)
- [ ] Rate limits are in-memory per server instance (now using Netlify's client-IP header and pruned). For durable limits, count recent rows per hashed IP in Supabase. Website reviews are already capped at 2 pending per phone in the database
- [ ] Remove demo seed + demo banner; never ship `DATA_SOURCE=mock`

## Colour palette (see `../PALETTE.md`)

- [x] Add `--brass`, `--brass-deep`, `--brass-line` to `app/styles/tokens.css` (used by the new banner/navbar)
- [ ] Add the remaining planned tokens: `--champagne`, `--champagne-soft`, `--crimson-tint`, `--success`
- [ ] Replace hardcoded golds in `app/styles/site.css` (`#b08d4f`, `#93702f`, `#efe4cf`) and `.label-light` `#f2c9cf` with those tokens
- [ ] Fix contrast: contact-form selected chip text `#93702f` (4.1:1) → `--brass-deep`
- [ ] Switch review stars from crimson to brass (`.stars` in `site.css`; on light use `--brass-deep`)
- [ ] Fix admin light-theme contrast: `--ad-text-3` `#6d7890`, `--ad-beige` `#8c6f3e`, `--ad-warn` `#96700f`, `--ad-ok` `#178556` are below 4.5:1 for small text
- [ ] Fold the ~20 one-off hex values in `app/styles/admin.css` into `--ad-*` tokens
- [ ] Rename the misleading `--ad-violet` token (it holds champagne, not violet)

## Home hero ("Into focus")

- [x] Hero uses the Gemini images with art direction (`heroHome` in `lib/media.ts`: `hero-home-wide.jpg` >760px, `hero-home-tall.jpg` ≤760px); lens tuned via `--fx/--fy` in `site.css`. Alt kept empty/generic: AI image, not the real outlet
- [x] Explore section is a full-bleed three-way split (`components/site/ExplorePanels.tsx`) using the Gemini images `explore-about.jpg`, `explore-services.jpg`, `explore-contact.jpg` (the last is an AI-enhanced dusk version of the real storefront)
- [ ] Long term: swap in real outlet photography (the store's navy wall with the gold logo suits this hero)
- [x] Contrast section redesigned as a calm problem → answer spread (symptom list + eye-exam photo with overlapping navy panel); no blur/lens effects, so the focus idea stays with the hero

## Accessibility follow-ups

- [ ] WCAG 2.2.2 (Pause, Stop, Hide): the Home brand loop and the Services contact-lens loop run forever with no visible pause button (client choice); they pause only on hover/focus, which touch users can't rely on. Options: a small pause button, or stop after ~3 loops (`animation-iteration-count: 3`) and rest. Confirm with the client.

- [x] FAQ hydration mismatch under reduced motion fixed (FAQ rebuilt as "Ask the optometrist")

- [x] Global focus ring is now `--crimson-dark` (light surfaces); dark sections override to ivory / `--crimson-soft` ones
- [x] Every WhatsApp button/link carries an sr-only "(opens WhatsApp)" hint

- [ ] Home brand strip auto-loops with no visible pause button (client's choice); it pauses on hover, tap and keyboard focus. Strict WCAG 2.2.2 expects a visible pause control: revisit if an accessibility audit is required


- [x] **Raw AI video files moved out of `public/` to `../archive-unused/`** (everything in `public/` is deployed): `Hailuo_Video_…568963841112674306.mp4` (17 MB, compressed copy now in `media/videos/about-shop.*`), `kling_20261020_…mp4` (8.7 MB, has a Kling watermark: must not ship), `gemini_generated_video_4f4edde5.mp4`
- [ ] Confirm the Hailuo plan used allows commercial use of the About hero video

- [ ] Get the full-size original of the logo-wall photo (current `about-logo-wall.jpg` is only 564×604, soft in the About hero)
- [ ] About story photos (`about-entrance.jpg`, `about-storefront.jpg`) are crops of small client photos (~565px wide) in `public/media/images/drive-download-…/`; ask for the full-size originals. Move/delete the `drive-download-…` folder and `.zip` once confirmed
- [ ] About "Your visit" photos are AI-generated (Gemini) stand-ins (`visit-*.jpg`): replace with the shop's own photos when available (no faces). Originals are in `archive-unused/`.
- [ ] Services menu photos are STOCK placeholders (`svc*` keys in `lib/media.ts`); contact lenses, fittings and kids are off-subject. Replace with 6 matching photos (Gemini prompts given, or real shop photos, no faces)
- [ ] Optional upsell (out of scope): separate SEO pages per service (e.g. "Eye test in OUG") once the owner supplies real detail and prices; for now each service has an anchor on /services (`#eye-examinations`, `#contact-lenses`, …)
- [ ] Contact map pin comes from Google's search for "Visionary Eyecare OUG Parklane" (it resolves to the shop); swap `mapsEmbed` for the exact Google Business Profile place embed once the address/map pin is confirmed
- [ ] About "3 labels" tile image is AI-generated (`about-labels.jpg`, unbranded frames). Original is in `archive-unused/`
- [ ] Owner to confirm the Lens Edit steps ("Choose your shades · We check fit and power with you · Take home four boxes")
- [ ] Owner to confirm About copy wording: eye tests "done on-site" and optician "aftercare" (fit checks, cleans, adjustments)
- [ ] Confirm the storefront promo banner offer ("50%", "Free", "Buy 3 Free 1") before showing the full storefront photo anywhere

## Code housekeeping

- [ ] `lib/types.ts` comment says "approved = live on website", but the code has separate `approved` and `live` statuses. Update the comment.
- [ ] `npm run lint` is broken (`next lint` removed in Next 16). Propose ESLint flat config to the user before adding
- [ ] `.gitignore` ignores `AUR-PRES-VE-2026*.pdf` but the proposal is now `Proposal AUR-PRES-VE-2026-003.pdf`. Fix the pattern before any commit
- [ ] Project folder has no `.git` directory. Re-initialise or re-clone before collaborating

## Launch (Netlify)

- [x] Full QA 2026-10-22: 10 device sizes (360px–1920px) × 6 pages with no overflow or JS errors; axe WCAG 2.2 AA 0 violations on phone + desktop; phone LCP ≤1.1s at 4× CPU throttle, CLS 0; SEO tags/JSON-LD/links valid; 21/21 end-to-end checks (enquiry form, review form, admin login/inbox/publish, sign-out, logged-out rejection); test data deleted from Supabase.
- [x] Security headers (nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy, HSTS) in `next.config.mjs`. CSP not added yet (needs nonces for Next inline scripts + Maps iframe).
- [x] Fixed: publishing a review now refreshes the public pages (`revalidatePath('/(site)', 'layout')`: there is no `app/layout.tsx`).
- [ ] Netlify preview: set `SITE_NOINDEX=true` (blocks robots + `X-Robots-Tag: noindex`). **Remove it on the real production site.**
- [ ] Vercel production: Vercel has no `URL` env like Netlify, so set `NEXT_PUBLIC_SITE_URL` to the real domain there.

- [ ] Netlify env vars: `SESSION_SECRET`, Supabase keys, `DATA_SOURCE=supabase`, GA ID, email provider key
- [ ] Domain + SSL on Netlify
- [ ] Post-deploy smoke check: 4 public routes, WhatsApp links, enquiry form end-to-end, `/admin` login and logged-out rejection, `robots.txt`, sitemap
- [ ] Core Web Vitals check on mobile (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Handover walkthrough with the owner (website + admin panel)

## Clean-up done 2026-10-21
- [x] Unused media moved to `archive-unused/` at the project root (not deployed; see its README): raw AI videos, Gemini originals, Entrance Pic download + zip, unused stock/old promo photos. Delete the folder after client sign-off
- [x] Home hero + Explore photos recompressed (2–3 MB → 150–300 KB; originals in `archive-unused/originals-before-compression/`). `public/` 68 MB → 8.8 MB
- [x] Removed unused code: `PageHero`, `ReviewSpotlight`/`ReviewCard`, `OpenBadge` default export, `CollectionCarousel.tsx`, and their CSS (copies in `archive-unused/code-before-cleanup/`)
- [x] `public/llms.txt` (AI answer engines) + richer `Optician` JSON-LD (description, brands, PNG logo)
