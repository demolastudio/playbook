---
description: Use at the end of a project to capture learnings that improve the playbook
---

# Learnings

When triggered, generate a `LEARNINGS.md` using the template at `.playbook/learnings-template.md`.

## Process

1. Read `.playbook/learnings-template.md` for the structure
2. Review the project codebase and recent history, plus `CONTEXT.md` and `docs/adr/` — reference recorded decisions, never restate them
3. Fill in every section with specific, actionable insights
4. Save as `LEARNINGS.md` in the project root

## What to Capture

- **Patterns that worked** — architecture decisions worth repeating
- **Mistakes made** — classify each first. A **mechanical** one (a banned API, an import shape, a file location, a deprecated call) becomes a deterministic check: a lint rule, a hook, or a CI job. Only a **judgement** call becomes a `.playbook/rules/mistakes.md` entry. A project with no guardrail at all (no hook, no CI running the gates) is itself a finding
- **Missing information** — what the agent couldn't see that it needed (dev-server logs, a read-only view of a third-party service)
- **Missing playbook content** — gaps discovered during the project
- **Tool/package insights** — gotchas, workarounds, version-specific issues
- **Performance learnings** — what was slow, what fixed it

## Rules

- Be specific — "Prisma N+1 queries on booking list page fixed with `include`" not "database was slow"
- Only capture insights that would help a FUTURE project
- If a judgement mistake was recurring, add it to `rules/mistakes.md` directly; a mechanical one goes into the stack's `checks.md` config instead
