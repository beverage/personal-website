# CLAUDE.md

Guidance for Claude Code working on `beverage.me` — Alex Beverage's personal
website. Keep this file short. If it grows past ~150 lines, split into
referenced docs.

## What this site is

Personal site and portfolio at `beverage.me`, deployed on Fly.io. It is
**primarily a job-search asset** — a showcase for founding-engineer / senior
roles — and secondarily the public face for projects. Treat it accordingly:
changes should serve the pitch, not add features for their own sake.

The hero project is **levelang.app**. Everything else (Language Quiz Service,
anything else that appears later) is secondary context. If a change risks
diluting Levelang's prominence, push back.

## Sacred: the cinematic starfield

The animated star cluster + course-change transitions are the site's
signature. They are not to be removed, simplified away, or replaced with
stock animations. Tune, refine, and improve — but preserve the effect.

Relevant code:

- `src/components/starfield/*` — renderers (Canvas2D + WebGL) and cluster
- `src/hooks/useStarField*.ts` — animation loops, transitions, speed
- `src/lib/animation/AnimationStateMachine.ts` — state coordination
- `src/types/transitions.ts` — `COURSE_CHANGE_PRESETS`, easing, content-fade
  ratios. The active preset is `'banking-turn'` (see `PageLayout.tsx`).

## Stack

- **Next.js 15 App Router**, **React 19**, **TypeScript**, **Tailwind 4**
- **framer-motion** for content transitions, custom Canvas/WebGL for starfield
- Self-hosted **Exo 2** variable font via `next/font/local`
- **Vitest** + React Testing Library for unit; **Playwright** for E2E;
  **Storybook** for component development
- Deploy: **Fly.io** via GitHub Actions on push to `main`

## Key paths

| Path                                           | Role                                                        |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `src/app/page.tsx`                             | Home entry, JSON-LD schema                                  |
| `src/app/layout.tsx`                           | Metadata, OG, fonts, context providers                      |
| `src/components/ui/PageLayout.tsx`             | Top-level layout + navigation state machine                 |
| `src/components/ui/ContentSection.tsx`         | Conditional hero/projects/contact/quiz rendering            |
| `src/components/ui/HeroSection.tsx`            | Hero copy + primary/secondary CTAs                          |
| `src/components/portfolio/PortfolioScroll.tsx` | Project cards + carousel                                    |
| `src/data/portfolio.ts`                        | Base project data (tech stack, videos, links, status)       |
| `src/locales/en.json`, `fr.json`               | **All user-facing copy**                                    |
| `src/lib/config.ts`                            | Env-var-driven config (social links, email, CV URL)         |
| `src/app/api/`                                 | Server-side proxies (pattern in `api/quiz/random/route.ts`) |

## Copy and i18n

- **All user-visible strings live in `src/locales/en.json` and `fr.json`** —
  never hardcode copy in components. Both files must be updated together for
  every copy change, otherwise the French build will fall through to the
  English key and break the language toggle.
- If a French translation is uncertain, ask the user before committing —
  Alex does not speak French fluently enough to self-verify.
- Portfolio project copy is keyed by `translationKey` in
  `src/data/portfolio.ts` and resolved against `projects.<key>` in the
  locale files.

## Config and secrets

All site configuration flows through environment variables, parsed by
`src/lib/config.ts` with a Zod schema. Never hardcode URLs or emails in
components — add a config field instead.

Current env vars:

- `GITHUB_PROFILE_URL`
- `LINKEDIN_PROFILE_URL`
- `INSTAGRAM_PROFILE_URL`
- `CONTACT_EMAIL_ADDRESS` — the forwarding alias `alex@beverage.me` (public;
  shown on the contact screen and in JSON-LD)
- `CV_URL` — absolute or same-origin path
- `LQS_SERVICE_URL`, `LQS_SERVICE_API_KEY` — Language Quiz Service proxy
- `CONTACT_RELAY_URL` — Supabase edge function URL for the contact form
  (`https://<ref>.supabase.co/functions/v1/contact-relay`). Server-only.
- `CONTACT_RELAY_TOKEN` — shared secret validated by the `contact-relay` edge
  function. Server-only; never sent to the client. Sent over the wire in a
  custom `x-contact-relay-token` header (not Authorization) so the Supabase
  gateway does not try to parse it as a JWT. Generate with
  `openssl rand -hex 32` and set the **same** value as `CONTACT_RELAY_TOKEN`
  on the Supabase project.
- `SUPABASE_ANON_KEY` — the Levelang Supabase project's anon/publishable key.
  Required by Supabase's gateway on every edge function call, even when
  `verify_jwt = false`. Passed as the `apikey` header alongside our real
  shared secret. Safe to expose (it's the same key any client-side Supabase
  SDK would carry), but kept server-only here because the contact relay is
  called server-to-server from `/api/contact`.

Fly.io holds the production values. For local dev, set them in `.env.local`
(gitignored). Never commit a real email or API key.

## Scripts

```bash
npm run dev              # Next.js dev server
npm run build            # Production build
npm run lint             # next lint
npm run lint:check       # max-warnings 0 (CI gate)
npm run format           # prettier --write .
npm test                 # vitest run
npm run test:watch       # vitest watch
npm run storybook        # storybook dev server
npx playwright test      # E2E suite
```

Before claiming a task done, run `npm run lint:check` and `npm test`. For UI
changes, exercise the feature in `npm run dev` in a real browser — type
checks and tests do not catch visual regressions.

## Commit style

Conventional-ish with a leading emoji matching the change type. Recent log
for reference:

- `✨` — new feature or user-visible enhancement
- `🎬` — starfield / transition / animation work
- `📄` — content / copy / CV updates
- `🔧` `⚒️` — config or small fixes
- `💄` — styling / layout polish
- `📱` — mobile-specific fixes

Keep the subject line short and specific. Commit messages are written by the
user — never commit unless explicitly asked.

## Things not to do

- Do not remove or simplify the starfield effect or its transition system.
- Do not hardcode user-facing copy; route everything through `locales/*.json`.
- Do not add a project card for the D2R community tools constellation. If it
  needs to be surfaced at all, it belongs as a single-line mention elsewhere
  (e.g., footer) — gaming-adjacent hobby work does not go on the front of
  the professional site.
- Do not introduce tracking, analytics, or marketing pixels without asking.
- Do not add hypothetical-future features, abstractions, or "just in case"
  flexibility. This is a small, focused site.
