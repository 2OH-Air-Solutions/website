# 2.0 Air (2-OH Air Solutions LLC) website

## Before doing anything
- Read OPERATIONS.md: it describes every account, secret, workflow, and DNS record.
  (It is written at the end of setup; until it exists, ask the owner before touching configuration.)
- If you change any configuration (secrets, workflows, DNS, hosting, form service),
  update OPERATIONS.md and add a change-log line in the same PR.

## Commands
- Install: `npm ci`   Build: `npm run build`   Checks: `npm run check`   Tests: `npm test`
- Local preview: `npm run dev`
- Requires Node 22.12 or newer.

## Source of truth
- All facts come from business-facts.md. Never invent or infer prices, hours,
  credentials, service areas, testimonials, stats, or guarantees.
- Contact details, hours, and towns are in src/data/business.ts and must match business-facts.md.
- If a request needs a fact that isn't there, stop and ask in the issue or PR.
- Specific things the owner has said must NOT appear: prices, years in business or house counts,
  the owner's personal name, licenses/registrations/certifications, brand names of products,
  any claim that we do blower door testing, any claim that we install insulation, and any
  promise that every house reaches 2.0 ACH (targets vary per project).

## The owner
- The owner is non-technical. Explain everything in plain language, with no jargon.

## Voice
- Plain and confident. A bit technical for builders, simple for homeowners.
  Short sentences. No superlatives unless business-facts.md backs them.

## Structure
- Astro, static output. Pages in src/pages, shared layout in src/layouts, components in src/components.
- Photos in src/assets/photos (served through astro:assets, which resizes them).
- Every page: title under 60 chars, meta description under 155 chars, canonical URL, one H1.

## Rules
- Work on a branch; open a PR. Never push to main.
- Never change MX, TXT, DKIM, or NS records, .github/workflows, or this file without the owner's approval.
- Never create CLAUDE.md or other tool-specific instruction files; this file is the single source of agent instructions.
- No tracking, cookies, or third-party embeds without approval.
- Never commit secrets. .env.local holds local keys and is git-ignored.
- Run the build and checks before opening a PR.
- Every PR lists each factual claim changed and includes phone and desktop screenshots.
