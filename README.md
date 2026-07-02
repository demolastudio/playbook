# My Playbook

A reusable, AI-readable engineering playbook for building production-ready platforms.

Clone it into any project. Your AI agent reads the rules, follows the stack profile, and can't declare a task done until the definition-of-done gates pass.

> **AI agents: the current date matters.** Always check the current date/time and the installed versions. Prefer current-version docs — never apply legacy patterns to a modern stack.

---

## What's Inside

```
my-playbook/
├── rules/                     ← Stack-agnostic rules (apply to EVERY project)
│   ├── global-rules.md        ← The canonical rule list (single source of truth)
│   ├── definition-of-done.md  ← Completion gates: typecheck, lint, tests, review checklist
│   ├── code-style.md          ← Principles: SSOT, Karpathy, loop engineering
│   ├── project-structure.md   ← Kebab-case, split-by-concern (per-stack mapping)
│   ├── mistakes.md            ← Known AI mistakes, each with the fix (living file)
│   ├── cursor-rules.md        ← Pointer for Cursor's Settings → Rules for AI
│   └── git-workflow.md        ← Git conventions (placeholder)
│
├── stacks/                    ← Stack profiles: conventions + checks + templates
│   ├── nextjs/                ← PRIMARY: Next.js 16 + Prisma + Zod + Better Auth
│   │   ├── STACK.md           ← Layout, conventions, template routing
│   │   ├── checks.md          ← Definition-of-done commands + optional hooks
│   │   └── templates/         ← Canonical code: server action, webhook,
│   │                             idempotent transaction, zod schema
│   ├── fastapi/               ← Outline (concept mapping from nextjs)
│   ├── nestjs/                ← Outline
│   └── turborepo/             ← Outline (composes with app stacks)
│
├── playbooks/                 ← Domain knowledge (stack-independent)
│   ├── core/                  ← Universal patterns (18 chapters + INDEX.md)
│   ├── booking/               ← Booking platform patterns (8 chapters)
│   ├── ecommerce/             ← Outline
│   ├── ui-ux/                 ← Outline
│   └── dashboard/             ← Outline
│
├── workflows/                 ← Slash commands / reusable workflows
├── recommended-skills.md      ← Package skills to install per project
├── learnings-template.md      ← Post-project knowledge capture template
├── setup.sh                   ← One-command install (detects the stack)
└── README.md                  ← This file
```

## How the Layers Fit

| Layer | Scope | Example |
| ----- | ----- | ------- |
| **rules/** | Every project, any language | "Kebab-case", "run definition-of-done" |
| **stacks/** | Projects using that stack | "Server Actions follow templates/server-action.ts" |
| **playbooks/** | Projects in that domain | "How to prevent double bookings" |

The philosophy: **artifacts and gates over prose.** Templates the agent copies beat rules it interprets; checks it must run beat promises it makes. Research puts prose-only rule compliance at 25–40% — the definition-of-done gate and stack templates exist to close that gap.

## Quick Start

### Project setup

```bash
bash /path/to/my-playbook/setup.sh /path/to/project
```

This clones `.playbook/` into your project, detects the stack (`next` / `@nestjs/core` in package.json, `fastapi` in Python deps, `turbo.json`), installs workflows for Claude Code, Cursor, and Antigravity, and generates an `AGENTS.md` — the open standard file read by 20+ AI tools.

### Global rules (all AI tools)

```bash
bash /path/to/my-playbook/setup.sh --global
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

## Framework Skills (Don't Duplicate These)

Some tools ship their own AI-readable docs. Don't write custom rules for them — reference the built-in docs instead.

| Tool | Built-in Docs | How to Use |
|---|---|---|
| **Next.js 16+** | `node_modules/next/dist/docs/` | Referenced in `stacks/nextjs/STACK.md` |
| **shadcn/ui** | Official SKILL.md | `npx skills add https://github.com/shadcn-ui/ui --skill shadcn` |

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
