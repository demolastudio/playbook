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

## CONTEXT-MAP (multi-context glossaries)

**Deferred (July 2026).** Solo projects have one bounded context. `formats/context.md` covers the single-context case; add the map format when a real monorepo needs two glossaries.
