# PALETTE.md — Visionary Eyecare colours

The complete colour reference for the public website and the admin panel. Brand colours requested by the client: **deep navy** and **crimson red**. Everything else here supports those two.

- **Code is the source of truth for values:** `visionary/app/styles/tokens.css` (public + shared) and `visionary/app/styles/admin-tokens.css` (admin). If a value here and the CSS disagree, the CSS wins. Fix this file.
- **Status labels:** **Live** = defined as a CSS token today. **Planned** = approved for the palette but not yet added to `tokens.css` (see `visionary/TODO.md`).
- Never hardcode a new hex in a component or stylesheet. Add a token first, then document it here.

---

## 1. Balance at a glance

| Share of a page | Colour family | Job |
|---|---|---|
| ~60% | Ivory / Paper (warm neutrals) | Backgrounds, cards, breathing room |
| ~25% | Navy / Midnight | Hero, footer, dark sections, headings, body text (Ink) |
| ~8% | Crimson | Calls to action and accent phrases: "do something here" |
| ~5% | Brass / Champagne | Quality details: stars, dividers, small icons, exclusive tags |
| as needed | Success green | Status feedback only |

---

## 2. Public website palette (`tokens.css`)

### Brand: navy family

| Token | Hex | Status | Use |
|---|---|---|---|
| `--midnight` | `#061230` | Live | Hero/footer backgrounds, darkest surface, admin canvas |
| `--navy` | `#0a1f4f` | Live | Primary dark, `.btn-navy`, dark sections |
| `--navy-2` | `#12306b` | Live | Hover/raised navy, gradients |
| (logo) | `#0b1f4d` | Asset only | Navy used inside `public/images/logo.svg`. Do not use as a UI token; use `--navy` |

### Brand: crimson family

| Token | Hex | Status | Use |
|---|---|---|---|
| `--crimson` | `#c8102e` | Live | Primary CTA `.btn-crimson`, `<em>` accent phrases in headings, labels on light |
| `--crimson-dark` | `#a30d25` | Live | CTA hover/pressed; crimson text on light where extra contrast is needed |
| `--crimson-soft` | `#f0697a` | Live | Crimson **on dark backgrounds** (text/accents), focus ring, open-badge dot |
| (label tint) | `#f2c9cf` | Hardcoded | `.label-light` (section labels on dark). Should become a token |

### Neutrals (warm)

| Token | Hex | Status | Use |
|---|---|---|---|
| `--paper` | `#fcfbf8` | Live | Default page background (`body`) |
| `--ivory` | `#f6f3ec` | Live | Alternate light sections, cards, FAQ background |
| `--ink` | `#0b1a38` | Live | Body text, headings on light |
| `--stone` | `#5c6779` | Live | Muted/secondary text on light |
| `--hair` | `rgba(11,26,56,.12)` | Live | Hairline borders on light |
| `--hair-light` | `rgba(255,255,255,.16)` | Live | Hairline borders on dark |
| (header glass) | `rgba(6,18,48,.92)` | Hardcoded | Scrolled/open header background (midnight at 92%) |

### Supporting accent: brass & champagne

Muted metallic gold, echoing metal frames and hinges. It gives the site a second accent so crimson can mean "act here" only.

| Token | Hex | Status | Use |
|---|---|---|---|
| `--brass` | `#c9a96a` | Live | Brass **on navy/midnight**: banner promo + status dot + icons, review stars, thin dividers, fine borders, "Exclusive" tag on dark |
| `--brass-deep` | `#8a6a2c` | Live | Brass **text or active indicator on ivory/paper** (passes AA): navbar active underline, drawer link numbers. Replaces `#93702f` |
| `--brass-line` | `#b08d4f` | Live (still also hardcoded in `site.css` chips and admin) | Decorative strokes on light only: navbar hover underline, menu-toggle hover border. **Never text** (2.8:1 on ivory) |
| `--champagne` | `#e4cfa6` | **Planned** (already `--ad-beige` in admin) | Selected states, soft tints on dark; unifies public and admin |
| `--champagne-soft` | `#efe4cf` | **Live** in `tokens.css` | Pale fills on light; warm beige section background (Services exclusive labels). Crimson text on it 4.67:1, ink 13.67:1, crimson-dark 6.31:1 (all pass AA); use `--crimson-dark` for focus rings on it |

### Status

| Token | Hex | Status | Use |
|---|---|---|---|
| `--success` | `#1f7a4d` | **Planned** | Form success message, positive confirmations on light. Never decorative |

### Planned tokens to add to `:root` in `tokens.css`

```css
  --champagne: #e4cfa6;
  --champagne-soft: #efe4cf;
  --crimson-tint: #f2c9cf;   /* .label-light */
  --success: #1f7a4d;
```

---

## 3. Admin panel palette (`admin-tokens.css`)

"Midnight Atelier": deep midnight foundation, warm champagne for active/selected, crimson for primary actions. Rules are in `AGENTS.md` §7.

### Dark theme (default, `body.admin-body`)

| Token | Value | Use |
|---|---|---|
| `--ad-canvas` | `var(--midnight)` | Page background |
| `--ad-s1` | `#0b1632` | Solid navy surface (tier 1) |
| `--ad-glass` | ivory 8% → 2.5% gradient | Ivory-tinted glass surface (tier 2) |
| `--ad-raised` | ivory 14% → 4.5% gradient | Raised/illuminated surface, hero KPI only (tier 3) |
| `--ad-input` | `rgba(4,10,28,.55)` | Form fields |
| `--ad-text` / `-2` / `-3` | `#f4efe6` / `#cfc7b8` / `#a09a8b` | Primary / secondary / muted text |
| `--ad-beige`, `--ad-glow` | `#e4cfa6` | Active/selected, warm highlight (= `--champagne`) |
| `--ad-glow-soft`, `--ad-violet` | champagne 16% / 14% | Soft selected fills (`--ad-violet` is champagne despite its name) |
| `--ad-line` / `-2` | ivory 11% / 20% | Borders |
| `--ad-crimson` | `var(--crimson)` | Primary action fill (white text on top) |
| `--ad-crimson-text` | `var(--crimson-soft)` | Crimson **text** on dark |
| `--ad-warn` | `#e8b45a` | Warning only |
| `--ad-ok` | `#3ecf8e` | Success only |

### Light theme (`body.admin-body[data-theme='light']`)

| Token | Value | Use |
|---|---|---|
| `--ad-canvas` / `--ad-s1` | `var(--ivory)` / `var(--paper)` | Background / solid surface |
| `--ad-raised` | `#fff` → `#f6f0e2` | Raised surface |
| `--ad-text` / `-2` / `-3` | `var(--ink)` / `#3d4a66` / `#6d7890` | Text tiers |
| `--ad-beige` | `#8c6f3e` | Active/selected text |
| `--ad-glow` | `#b08d4f` | Warm highlight (= `--brass-line`) |
| `--ad-line` / `-2` | ink 10% / 18% | Borders |
| `--ad-crimson-text` | `var(--crimson-dark)` | Crimson text on light |
| `--ad-warn` / `--ad-ok` | `#96700f` / `#178556` | Warning / success |

The sidebar keeps the dark-theme text colours in light mode.

`admin.css` also contains ~20 one-off hex values (warm creams such as `#f1e6cf`, `#efe3c8`, `#e6dbc4`, and deep navies such as `#0a1230`, `#12224e`). Fold them into `--ad-*` tokens when that file is next touched.

---

## 4. Usage rules

1. **Crimson = action.** Buttons, WhatsApp CTAs, the italic accent phrase in a heading, section labels. Don't spend it on decoration.
2. **Brass = detail.** Stars, hairline dividers, small icons, short tags. Never large fills or backgrounds, and never at the same visual weight next to crimson.
3. **One accent leads per section.** A section led by crimson shouldn't also lead with brass.
4. **On dark backgrounds** use `--crimson-soft` for crimson text and `--brass`/`--champagne` for gold. `--crimson` text on navy fails contrast. Use it only as a fill behind white text.
5. **On light backgrounds** use `--brass-deep` for gold text. `--brass-line` is decoration only.
6. **Keep neutrals warm.** Ivory/paper are warm. Do not introduce cool grey-blue backgrounds next to them.
7. **Status colours are functional only.** Success/warning colours never decorate.
8. **Motion and states** (hover, focus, selected) reuse these tokens. Focus ring is always `--crimson-soft`.

### Colours to avoid

| Avoid | Why |
|---|---|
| Bright yellow or saturated gold | Navy + red + white + yellow reads as the Malaysian flag, which looks governmental. Keep gold muted and brassy |
| Teal / cyan | Aurexis's own brand colours, and the generic "medical clinic" look |
| Purple, orange, extra blue hues | Compete with navy and crimson and cheapen the look |
| Cool grey-blue backgrounds | Clash with the warm ivory neutrals (muddy) |
| Gradient text, neon glows | Off-brand "AI slop" patterns (see AGENTS.md §5 Design Context) |
| Pure black `#000` for text | Use `--ink`; black is only acceptable in shadows |

---

## 5. Contrast (WCAG 2.2 AA: 4.5:1 normal text, 3:1 large text ≥24px or 19px bold, 3:1 UI/icons)

### Public site

| Foreground on background | Ratio | Verdict |
|---|---|---|
| `--ink` on `--paper` / `--ivory` | 16.7 / 15.5 | Pass |
| `--stone` on `--paper` / `--ivory` | 5.5 / 5.2 | Pass |
| `--navy-2` on `--paper` | 12.2 | Pass |
| `--crimson` on `--paper` / `--ivory` | 5.7 / 5.3 | Pass |
| `--crimson-dark` on `--paper` | 7.7 | Pass |
| White on `--crimson` / `--crimson-dark` | 5.9 / 8.0 | Pass |
| White on `--midnight` / `--navy` | 18.5 / 15.9 | Pass |
| `--crimson-soft` on `--midnight` / `--navy` | 6.2 / 5.3 | Pass |
| `--crimson` on `--navy` | 2.7 | **Fail**: fill only, never text |
| `--brass` on `--midnight` / `--navy` | 8.2 / 7.1 | Pass |
| `--champagne` on `--navy` | 10.4 | Pass |
| `--brass-deep` on `--paper` / `--ivory` | 4.9 / 4.5 | Pass |
| `--success` on `--paper` / `--ivory` | 5.1 / 4.8 | Pass |
| `--brass-line` `#b08d4f` on `--ivory` | 2.8 | **Fail**: decoration only |
| `#93702f` on `--ivory` (current contact-form selected chip text) | 4.1 | **Fail**: replace with `--brass-deep` |

### Admin

| Foreground on background | Ratio | Verdict |
|---|---|---|
| `--ad-text` / `-2` / `-3` on `--ad-s1` (dark) | 15.6 / 10.7 / 6.4 | Pass |
| `--ad-warn` / `--ad-ok` / crimson-soft on `--ad-s1` (dark) | 9.5 / 9.0 / 6.0 | Pass |
| Light `--ad-text-2` `#3d4a66` on ivory | 8.0 | Pass |
| Light `--ad-text-3` `#6d7890` on ivory / paper | 4.0 / 4.3 | **Fail** for small text |
| Light `--ad-beige` `#8c6f3e` on ivory / paper | 4.3 / 4.6 | **Fail** on ivory |
| Light `--ad-warn` `#96700f` on paper | 4.4 | **Fail** for small text |
| Light `--ad-ok` `#178556` on paper | 4.48 | **Fail** (just under 4.5) |

Admin text is 11–14px, so these must meet 4.5:1. Darken them slightly when fixing (tracked in `visionary/TODO.md`).
