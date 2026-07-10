# Recommended Skills

> AI agents: check this list and suggest installing relevant skills for the current project.
> Install commands drift — always verify against the skill's own README before running.

## Vet Before You Install (Non-Negotiable)

Snyk's ToxicSkills research found **prompt injection in 36% of tested skills** and 1,400+ malicious payloads across the ecosystem. Before installing ANY skill:

1. **Read the SKILL.md and every bundled script** — especially Python/shell scripts that execute locally
2. **Check the source** — Anthropic/Vercel/official-project repos carry lower risk than unknown authors
3. **Review the `allowed-tools` frontmatter** — a design skill has no business requesting network or shell access
4. **Re-review after updates** — a safe skill can turn malicious in a later version

## Design Skills

All entries verified against their primary repos (July 2026):

| Skill | Backed by | What It Provides | Install |
|---|---|---|---|
| **frontend-design** | Anthropic — `anthropics/skills` (160k★), verified at `skills/frontend-design` | Aesthetic direction: styles, palettes, font pairings; forces a committed visual direction | Official: `/plugin marketplace add anthropics/skills` (or `npx skills add anthropics/skills --skill frontend-design`) |
| **web-design-guidelines** | Vercel — `vercel-labs/agent-skills` (28.9k★), verified | UI **review gate**: audits finished UI against 100+ accessibility/UX rules — run before shipping any page | `npx skills add vercel-labs/agent-skills` (official README command) |
| **ui-ux-pro-max** | Community — `nextlevelbuilder/ui-ux-pro-max-skill`, repo verified | Design database with industry reasoning: 161 product-type rule sets (incl. beauty/health services — booking-SME territory), matched palettes, local BM25 search | `npm i -g ui-ux-pro-max-cli && uipro init --ai claude` (from its README) — review `scripts/search.py` first |
| **shadcn/ui** | Official project | Project-aware component intelligence; discover existing components before building custom | [ui.shadcn.com/docs/skills](https://ui.shadcn.com/docs/skills) |

### Precedence (Read This Before Using Design Skills)

- **The user's Design Taste (`playbooks/ui-ux/INDEX.md`) and the project's `DESIGN.md` outrank every installed skill's defaults.** Skills execute the committed direction — they never choose it. Concretely: frontend-design bans Inter; this playbook's taste specifies Inter/Outfit for body text — **the taste wins**.
- **ui-ux-pro-max generates a `MASTER.md` design system** — treat it as *input* to the project's `DESIGN.md` (merge what survives the taste filter), never as a rival source of truth. One design lock per project.
- Design skills complement `playbooks/ui-ux/anti-ai-design.md`: the chapter decides and locks the direction; the skills supply execution vocabulary.

## Engineering Skills (Next.js stack)

| Skill | What It Provides | Source (verified) |
|---|---|---|
| **react-best-practices** (Vercel) | React/Next.js performance rules from Vercel Engineering, prioritized (waterfalls > bundle > re-renders) | `npx skills add vercel-labs/agent-skills` |
| **composition-patterns** (Vercel) | Component API architecture — variant components over boolean-prop proliferation | Same repo/command as above |
| **Next.js 16+ docs** | Built-in — `node_modules/next/dist/docs/`, no install needed | Referenced in `stacks/nextjs/STACK.md` |

## Recommended Packages

| Package | Install | When To Use |
|---|---|---|
| **Arcjet** | `npm i @arcjet/next` | EVERY project. Rate limiting, bot protection, WAF shield |
| **Prisma** | `npm i prisma @prisma/client` | Database ORM — see `playbooks/core/database.md` |
| **Zod** | `npm i zod` | Schema validation — all schemas go in `schemas/` folder |
| **Stripe** | `npm i stripe` | Payments — see `playbooks/core/billing.md` |

## Considered & Skipped (July 2026)

- **Taste** (anti-slop, 13 skills) — ~70% overlap with `anti-ai-design.md` at a much higher context cost. Revisit if frontend-design underdelivers.
- **Bencium UX Designer** — 28K characters of UX fundamentals the ui-ux chapters already cover.
- **AccessLint** — `core/accessibility.md` + axe scans cover current needs. Revisit for a compliance-heavy client.
- **React Native skills** — not a current stack.
- **Dashboard skills** (dashboard-design, admin-dashboard, dashboard-creator) — community one-shot HTML generators; wrong shape for production admin panels and unvetted authors. `ui-ux/dashboards.md` + `playbooks/dashboard/` are the dashboard tooling here; web-design-guidelines audits the result.
