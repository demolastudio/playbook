# Handoff — Playbook

Generated: 2026-07-16 (migration to demolastudio/playbook)

## Goal

The engineering playbook consumed by every project via `setup.sh`: agnostic rules + per-stack profiles + domain playbooks + workflows, with gates over prose as the core philosophy. This repo moved from `signordemola/my-playbook` (Documents/my-playbook) to `demolastudio/playbook` (Documents/personal/demolastudio-oss/playbook) on 2026-07-16.

## Current State

- [x] Full architecture: rules (9 global, definition-of-done gate), stacks (nextjs complete; fastapi/nestjs/turborepo stubs with checks), playbooks (core 19, booking 17 — the specialty, dashboard 4, ui-ux 3), workflows (10 incl. /flow router + /grill), formats (CONTEXT.md + ADR), governance (MAINTENANCE.md, out-of-scope.md, repo CLAUDE.md)
- [x] setup.sh: stack detection, marker-merged AGENTS.md (managed block, coexists with create-next-app's), always-on rules per tool (.agent(s)/rules for Antigravity, .cursor playbook.mdc alwaysApply, globals for Claude/Gemini/Codex), idempotent re-runs
- [x] First learnings loop completed (Horizon Credit Union harvest)
- [ ] Untested on a real project end-to-end — the next milestone

## Decisions Made (do NOT re-litigate; see also out-of-scope.md)

- Local folder lives inside the demolastudio-oss workspace; workspace repo gitignores it (`*/`)
- Playbook is public under the org; internal tooling, NOT on the OSS artifact map
- Additions follow: brainstorm (grill-style) → research primary sources → confirm → write
- Commits: plain messages, user's identity only — never AI co-author attribution

## Blocked On / Open

- `rules/git-workflow.md` — placeholder awaiting the user's git conventions
- Antigravity `.agent/` vs `.agents/` — both installed; user to observe which loads, then delete the dead path
- Fintech playbook — deferred until fintech proves recurring (out-of-scope.md)
- Old repo `signordemola/my-playbook` — archive after confirming projects re-point

## Next Steps

1. Run a real project through the full loop (/grill → /spec → build → /review → /deploy-check → /learnings); watch whether definition-of-done gates fire unprompted — add the Stop hook from stacks/nextjs/checks.md if not
2. Re-run `setup.sh` on active projects to re-point `.playbook` remotes and get the new wiring
3. Harvest the first LEARNINGS.md per the process in the memory files
