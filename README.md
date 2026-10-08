# Playbook

A reusable, AI-readable engineering playbook for building production-ready platforms.

Clone it into any project. Your AI agent reads the rules, follows the stack profile, and can't declare a task done until the definition-of-done gates pass.

> **AI agents: the current date matters.** Always check the current date/time and the installed versions. Prefer current-version docs — never apply legacy patterns to a modern stack.

---

## What's Inside

```
playbook/
├── rules/                     ← Stack-agnostic rules (apply to EVERY project)
│   ├── global-rules.md        ← The canonical rule list (single source of truth)
│   ├── definition-of-done.md  ← Completion gates: typecheck, lint, tests, review checklist
│   ├── code-style.md          ← Deep modules: seams, deletion test, injected deps
│   ├── project-structure.md   ← Kebab-case, split-by-concern (per-stack mapping)
│   ├── mistakes.md            ← Known AI mistakes, each with the fix (living file)
│   ├── cursor-rules.md        ← Pointer for Cursor's Settings → Rules for AI
│   └── git-workflow.md        ← Git conventions (placeholder)
│
├── stacks/                    ← Stack profiles: decisions + gates + templates
│   ├── vinext-cloudflare/     ← PRIMARY: vinext on Workers + Hyperdrive/Neon +
│   │                             Drizzle + Better Auth (inherits nextjs conventions)
│   ├── nextjs/                ← SECONDARY: Next.js 16 on Vercel + Prisma 7
│   │   ├── STACK.md           ← Layout, conventions, template routing
│   │   ├── checks.md          ← Definition-of-done commands, oxlint gate, hooks
│   │   ├── project-files/     ← Guardrail files setup.sh copies into projects:
│   │   │                         CI gates, lint config, Dependabot, pnpm policy,
│   │   │                         Claude Code settings + cloud-session hook
│   │   └── templates/         ← Canonical code: server action, webhook,
│   │                             idempotent transaction, zod schema
│   ├── fastapi/               ← Outline (concept mapping from nextjs)
│   ├── nestjs/                ← Outline
│   └── turborepo/             ← Outline (composes with app stacks)
│
├── playbooks/                 ← Domain knowledge (stack-independent)
│   ├── core/                  ← Universal patterns (20 chapters + INDEX.md)
│   ├── booking/               ← Booking platform patterns (17 chapters — the specialty)
│   ├── ui-ux/                 ← Design taste + anti-AI design, responsive, dashboards
│   ├── dashboard/             ← Admin functionality: tables, CRUD, RBAC, exports
│   └── ecommerce/             ← Outline
│
├── workflows/                 ← Slash commands (/flow is the router — start there)
├── formats/                   ← Artifact templates: CONTEXT.md glossary, ADRs, DESIGN.md
├── recommended-skills.md      ← Package skills to install per project
├── learnings-template.md      ← Post-project knowledge capture template
├── MAINTENANCE.md             ← Invariants for editing this repo
├── CLAUDE.md                  ← Points agents editing this repo at MAINTENANCE.md
├── out-of-scope.md            ← Rejected ideas, with reasons
├── setup.sh                   ← One-command install (detects the stack)
├── scripts/                   ← This repo's own checks and the monthly freshness report
└── README.md                  ← This file
```

Projects grow three durable artifacts alongside the code: **`CONTEXT.md`** (the domain glossary — one concept, one word, used in all naming), **`docs/adr/`** (one-paragraph decision records, gated by the three-question test), and **`DESIGN.md`** (the design lock — tokens plus reasons, linted, and the source the Tailwind theme is generated from). The first two are built during `/spec` interviews; see `formats/`.

## How the Layers Fit

| Layer | Scope | Example |
| ----- | ----- | ------- |
| **rules/** | Every project, any language | "Kebab-case", "run definition-of-done" |
| **stacks/** | Projects using that stack | "Server Actions follow templates/server-action.ts" |
| **playbooks/** | Projects in that domain | "How to prevent double bookings" |

The philosophy: **artifacts and gates over prose.** Templates the agent copies beat rules it interprets; checks it must run beat promises it makes. Research puts prose-only rule compliance at 25–40% — the definition-of-done gate and stack templates exist to close that gap.

Stacks change fast, so fast-moving facts stay out of prose: deprecated APIs fail lint and name their replacement, APIs are read from the installed packages' docs, dependency updates arrive as scheduled PRs that must pass the gates, and the few traps no tool reports carry the version they were seen on. The foundation (rules, core principles, templates) changes rarely — that is what lets frequent upgrades stick.

## Quick Start

### Project setup

```bash
bash /path/to/playbook/setup.sh /path/to/project
```

This clones `.playbook/` into your project, detects the stack (`vinext` / `next` / `@nestjs/core` in package.json, `fastapi` in Python deps, `turbo.json`), installs workflows for Claude Code, Cursor, and Antigravity, and wires the rules into every tool's **always-loaded layer**:

- **AGENTS.md** (open standard, 20+ tools) — written as a *managed block*: if the project already has an AGENTS.md (e.g. generated by `create-next-app`), the playbook block is appended and existing content is never touched; re-runs refresh only the block
- **Claude Code** — reads `AGENTS.md` only when no `CLAUDE.md` exists, so setup adds a one-line `@AGENTS.md` import to `CLAUDE.md` (creating it if missing; your content is never touched)
- **Antigravity** — `.agents/rules/playbook.md` (plus `.agent/` for older versions), auto-loaded workspace rules so Gemini can't skip them
- **Cursor** — `.cursor/rules/playbook.mdc` with `alwaysApply: true`; workflows install as slash commands in `.cursor/commands/`
- **Guardrail files** (JS stacks) — `stacks/<stack>/project-files/` copied into the project: the `gates` CI workflow with SHA-pinned actions, `.oxlintrc.json`, Dependabot, the pnpm supply-chain policy, check scripts, and `.claude/settings.json` (no AI attribution) with a SessionStart hook that installs dependencies and fetches `.playbook/` in Claude Code cloud sessions. Commit them. Then add the gate scripts and the pnpm pin to `package.json` and, on GitHub, a branch ruleset on `main` requiring the `gates` check — the stack's `checks.md` has the details.

Once per new project, skim `.playbook/recommended-skills.md` and install the package skills that fit; agents don't re-read it each session.

Re-run `setup.sh` on a project any time — it's idempotent and refreshes everything except the guardrail files, which it never overwrites: it lists the ones that differ from the playbook's copy for you to merge.

> **Antigravity model note:** use Gemini Pro for `/spec` and planning; use Flash only for mechanical implementation under an approved plan — Flash follows instructions less reliably, and the CI gates are the backstop it can't bypass.

### Global rules (all AI tools)

```bash
bash /path/to/playbook/setup.sh --global
```

Installs `rules/global-rules.md` into:

| Tool | Global Config |
|---|---|
| **Claude Code** | `~/.claude/CLAUDE.md` |
| **Gemini CLI** | `~/.gemini/GEMINI.md` (add `AGENTS.md` to `context.fileName` for project files) |
| **OpenAI Codex** | `~/.codex/AGENTS.md` |
| **Cursor** | Manual — paste `rules/global-rules.md` into Settings → Rules for AI |

Re-running pulls the latest playbook without overwriting your files.

---

## Day-to-Day Use

Once a project is set up, you drive everything with slash commands. Forget which one? Type `/flow` — it's the map.

### The main loop (every feature)

| Step | You type / do | What happens |
| ---- | ------------- | ------------ |
| 0 | `/grill` + a raw idea | Relentless interview in numbered rounds (every question whose prerequisites are settled), each with a recommended answer, until the idea hardens into a brief — for ANY fuzzy idea (feature, package, post, business move), before `/spec` or standalone |
| 1 | `/spec` + your idea | The agent interviews you until requirements are unambiguous — and builds `CONTEXT.md` + ADRs as terms and decisions get resolved |
| 2 | Approve the plan | The agent must present a plan and wait (global rule 2) — read it, push back, then approve |
| 3 | Let it build | Stack templates + rules govern the code; definition-of-done gates run before it claims "done" |
| 4 | `/review` | Two-axis review: Standards (playbook rules + code smells) and Spec (did it build what you asked?) |
| 5 | `/deploy-check` | Production-only checklist, before every deploy |
| 6 | `/learnings` | End of project: generates `LEARNINGS.md` — you review it and fold the keepers back into this playbook |

### When things come up

| Situation | Type |
| --------- | ---- |
| Something is broken | `/debug` — it must reproduce the bug with a failing check before touching code |
| Health check on an active project | `/audit` — run every few days |
| Restructure without behavior change | `/refactor` |
| Session getting long / switching tasks | `/handoff` — then start a fresh session and say "read HANDOFF.md" |
| Not sure which of these | `/flow` |

### Artifacts that appear in your projects

- **`CONTEXT.md`** — the domain glossary. Commit it; it makes every future session cheaper and naming consistent.
- **`docs/adr/`** — one-paragraph decision records. Commit them; they stop future sessions from "fixing" deliberate choices.
- **`DESIGN.md`** — the design lock. Commit it with the generated theme; `scripts/check-design.sh` keeps the two in step.
- **`HANDOFF.md`** — session bridge. Transient; commit optional.
- **`LEARNINGS.md`** — post-project. Review, harvest into the playbook, then delete.

### Optional: hard enforcement

Rules are probabilistic; hooks are not. When you want the definition-of-done gate physically enforced (the agent *cannot* finish with failing checks), merge the Stop hook from `stacks/nextjs/checks.md` into the project's `.claude/settings.json`. Recommended: run your first project without it to see how the prose rules perform, then add it.

### Keeping things current

| To update | Run |
| --------- | --- |
| Everything in a project (playbook copy, AGENTS.md block, always-on rules, workflows) | `bash setup.sh /path/to/project` — idempotent, safe to re-run |
| Global rules after editing `rules/global-rules.md` | `bash setup.sh --global` + re-paste into Cursor's global settings |
| A project's guardrail files | Never overwritten — a `setup.sh` re-run lists the files that differ from `.playbook/stacks/<stack>/project-files/`; merge by hand. The project's Dependabot bumps the action pins |
| This repo itself | Read `MAINTENANCE.md` first; check `out-of-scope.md` before direction changes. The `playbook-checks` workflow checks the invariants a script can see on every PR |
| Knowing *when* the playbook is stale | Automatic: on the 1st of each month a GitHub Action compares package versions, upstream skills, and the shipped workflows' action pins against the recorded baselines and opens a `playbook-freshness` issue assigned to you when something moved (run it any time from the Actions tab) |

---

## Framework Skills (Don't Duplicate These)

Some tools ship their own AI-readable docs. Don't write custom rules for them — reference the built-in docs instead.

| Tool | Built-in Docs | How to Use |
|---|---|---|
| **vinext** | `node_modules/vinext/README.md`, `node_modules/@vinext/cloudflare/README.md` | Referenced in `stacks/vinext-cloudflare/STACK.md` |
| **Cloudflare `cf` CLI** | `cf --help` | Commands and flags change between betas — ask the tool |
| **Next.js 16+** | `node_modules/next/dist/docs/` | Referenced in `stacks/nextjs/STACK.md` |
| **shadcn/ui** | Official skills | [ui.shadcn.com/docs/skills](https://ui.shadcn.com/docs/skills) — see `recommended-skills.md` |

---

## Post-Project Learnings

After finishing a project, AI generates a `LEARNINGS.md` using `learnings-template.md`. You review it, then update the playbook — rules for universal lessons, the stack profile for stack lessons, the domain playbook for domain lessons. This is how the playbook grows.

Starting a project on a new stack? Copy the outline in `stacks/fastapi/STACK.md` as the pattern: concept mapping first, then fill in conventions, checks, and templates as the project teaches you.

---

## Keeping Rules Effective (Token Budget)

> AI agent compliance drops when rule files exceed ~200 lines — and every
> always-loaded line costs tokens on every single request.

The token model: only `global-rules.md` (global config) and the generated
`AGENTS.md` are always in context — together under 50 lines. Everything else
loads on demand: rules when starting work, one INDEX per relevant domain,
then ONLY the routed chapters. An agent working on forms never pays for the
billing chapter.

- Keep each rule file **under 50 lines**, each playbook chapter **under ~150 lines** (200 hard max — split like `booking/calendar-sync.md` when a chapter outgrows it)
- **One rule, one home.** `global-rules.md` is canonical; other files explain or extend, never repeat
- **INDEXes route, they don't teach.** Content in an INDEX is paid for by every task in that domain
- Prefer **dense tables over prose** in chapters — same knowledge, fewer tokens
- Use the **"remove test"**: if deleting a rule wouldn't cause a mistake, remove it
- Prefer **gates over rules**: if a mistake keeps recurring, turn the rule into a check in `definition-of-done.md` or a hook in `stacks/<stack>/checks.md`
- Update `rules/mistakes.md` when you notice recurring AI problems — always as a *don't → instead* pair
