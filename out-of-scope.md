# Out of Scope

> Ideas considered and rejected, with reasons — so they don't get re-proposed
> every six months. An entry leaves this file only when its reason stops being true.

## Repackaging the playbook as installable skills

**Rejected (July 2026), revisit after real-project testing.** The `npx skills` distribution model would replace setup.sh for workflows, but knowledge routing stays file-based: Vercel's evals showed always-available bundled context hit 100% where skill-based (invoke-on-demand) retrieval peaked at 79% — agents often fail to recognize when to invoke. AGENTS.md forced reading is the stronger design for rules and domain knowledge.

## Model-invoked domain knowledge

**Rejected (July 2026).** Same reason as above: playbook chapters are reached by forced INDEX routing, not by hoping the agent invokes a skill. The zero-context-load side of the trade-off is already captured by workflows being user-invoked slash commands.

## Distinctive display font for headings

**Rejected (July 2026).** Contradicted the stated typography preference (Inter or Outfit, all text). Anti-AI-design escapes the generic look through type scale and weight contrast instead. Revisit only if the user changes their taste.

## Issue tracker / triage machinery

**Deferred (July 2026).** Solo developer, no incoming raw issue stream. Real overhead, no current payoff. Revisit if collaborators or user-reported bugs arrive at volume.

## Versioning the playbook with changesets

**Rejected (July 2026).** Git history is a sufficient changelog for a personal playbook consumed via `git pull`.

## Wayfinder-style ticket-map planning

**Rejected (July 2026).** mattpocock's wayfinder plans multi-session work as investigation tickets on an issue tracker — but it presupposes the issue-tracker machinery already declined above. `/handoff` + `/spec` cover the solo-developer version. Revisit together with the issue-tracker entry if collaborators arrive.

## Fintech domain playbook

**Deferred (July 2026).** The Horizon Credit Union project produced strong fintech patterns (client idempotency keys, atomic conditional debits, held-transfer reversal) — preserved in that project's own `docs/adr/`. A `playbooks/fintech/` outline waits on whether fintech becomes a recurring niche rather than a one-off.

## UI-hint cookie pattern (non-httpOnly role cookie)

**Deferred (July 2026).** Clever pattern from Horizon (static marketing pages + auth-aware header via `useSyncExternalStore`), but it's exactly the "clever option" the smallest-change rule warns about. Lives in that project's ADR-0004; promote to `stacks/nextjs/gotchas.md` only if a second project needs it.

## CONTEXT-MAP (multi-context glossaries)

**Deferred (July 2026).** Solo projects have one bounded context. `formats/context.md` covers the single-context case; add the map format when a real monorepo needs two glossaries.

## Renaming CONTEXT.md to GLOSSARY.md

**Rejected (October 2026).** mattpocock/skills 1.3.0 renamed its glossary convention with no stated reason. Following it means a `git mv` in every existing project and a dual-name period in setup.sh, for no behavior change — the file's format is otherwise identical. Revisit if a tool we use starts reading `GLOSSARY.md` by convention.

## Removing /merge-conflicts

**Rejected (October 2026).** Upstream removed `resolving-merge-conflicts` because agents resolve conflicts unaided. Ours stays: as a user-invoked slash command it costs no context until typed, and it carries the parts the default skips — both intents or a named trade-off, and the definition-of-done gates before the merge counts as done.

## /wait-what (re-pitch the last message)

**Rejected (October 2026).** Global rule 10 (ASD-STE100 output) prevents the unreadable message instead of repairing it afterwards. Revisit if output still lands unclear with the rule in place.

## PR-body format skill

**Deferred (October 2026).** `rules/git-workflow.md` leaves PR process to the user's stated conventions (global rule 8). Revisit when the user states a PR format.

## Installs for Antigravity, Gemini CLI, and Codex

**Removed (October 2026).** The user works in Claude Code and Cursor only; the other tools' copies were clutter that every re-run recreated. `AGENTS.md` still serves any tool that reads it. Revisit if another tool joins the daily workflow.
