# CLAUDE.md

@AGENTS.md

All project context, scope, commands, conventions and open work are in `AGENTS.md` (imported above). Keep that file as the single source of truth and update it rather than duplicating content here.

## Claude-specific notes

- **Every time before planning** (plan mode, todo list, or proposing an approach), re-read `CLAUDE.md` and `AGENTS.md` in full with the Read tool, even if they were read earlier in the session.
- **Working directory:** the Next.js app is in `visionary/`. Run `npm`/`npx` commands there. Run `npm install` first if `node_modules/` is missing.
- **Next.js 16 docs:** before writing framework-specific code, read the bundled docs at `visionary/node_modules/next/dist/docs/` (or use the `documentation-lookup` skill / Context7) instead of relying on memory. APIs differ from older versions.
- **Skills:** project skills are in `.claude/skills/`. Load the matching skill (table in AGENTS.md §8) before SEO, accessibility, UI design/polish, motion, copy, analytics, Supabase or deployment work. Design skills must work within the existing design system and the Design Context in AGENTS.md §5. Never restyle the brand.
- **Colours:** read `PALETTE.md` before any colour or styling work. Use tokens only. If you add or change a colour token, update `PALETTE.md` (value, role, contrast) in the same change.
- **Subagents** (`.claude/agents/`, table in AGENTS.md §8):
  - After any `.tsx` change → run `react-reviewer`.
  - After any UI change → run `a11y-architect`.
  - After changes to auth, Server Actions, the enquiry form, env/secrets or personal data → run `security-reviewer`.
  - After changes to `lib/` logic or actions → run `typescript-reviewer`.
  - Phase B schema/RLS/queries → run `database-reviewer`.
  - Fix every confirmed finding, or tell the user why it was skipped.
- **Definition of done:**
  - `npx tsc --noEmit` and `npm run build` pass in `visionary/`.
  - UI was checked at ~375px and desktop widths.
  - `visionary/TODO.md` is updated.
  - No business facts were invented.
  - For admin work: unauthenticated requests to every `/admin` page and admin endpoint are rejected server-side.
- **Admin panel:** implemented on a mock layer. See AGENTS.md §10.7 (what exists) and §10.6 (confirmed decisions). Media/motion/section edits follow the recipes in AGENTS.md §11; Supabase work is Phase B per §12. Never let the admin rewrite review text that is still attributed to Google.
- **Ask before:**
  - adding dependencies;
  - changing scope beyond the four public pages + admin panel;
  - replacing the design system or changing the brand palette (adding colour families beyond `PALETTE.md`);
  - adding test frameworks or ESLint;
  - touching `raw-assests/` or the proposal PDF.
