# Maintenance Invariants

> Rules for editing THIS repo. Break one and something downstream silently rots.

- **New chapter → INDEX row.** Every playbook chapter gets a routing-table row in its domain's INDEX.md, in the same change.
- **New or renamed workflow → update `workflows/flow.md`.** A router that lies is worse than no router.
- **Budgets:** rule files < 50 lines; chapters ~150 target, 200 hard max (split when over); INDEXes route, they never teach.
- **One rule, one home.** `rules/global-rules.md` is canonical. After changing it: re-run `setup.sh --global` and re-paste into Cursor.
- **Stack-specific content never goes in `rules/`, `workflows/`, or core chapters** — it belongs in `stacks/<stack>/`; agnostic files may cite a stack only as a labeled example.
- **Everything in `workflows/` becomes a slash command** (setup.sh copies it flat). Format templates and reference docs go in `formats/`, never in `workflows/`.
- **Workflow files must survive being copied out of the repo:** reference `.playbook/...` paths, never repo-relative links; frontmatter descriptions single-line, trigger-style, no double quotes (the Cursor .mdc conversion wraps them in quotes).
- **Prune with the no-op test:** per sentence, ask "does this change behavior versus the model's default?" If not, delete the sentence — don't trim it.
- **Anchor on leading words.** Prefer one strong pretrained concept the agent thinks with (*tight* loop, *red*, *seam*, *deep* module) over a restated triad ("fast, deterministic, low-overhead"). Fewer tokens, sharper behavior.
- **Prompt the positive.** State the target behavior instead of prohibiting the wrong one ("don't X" makes X more available, not less). Keep a prohibition only when it can't be phrased positively, and pair it with what to do instead.
- **Workflow descriptions: one trigger per branch.** Synonyms restating the same trigger are duplication — collapse them; keep only genuinely distinct entry conditions.
- **Before proposing a direction change, check `out-of-scope.md`** — it exists so rejected ideas stay rejected until the reasons change.
- **Upstream harvest source: `github.com/mattpocock/skills`** (last diffed 2026-07-16) — origin of /grill, /debug, /review's two axes + smells, /prototype, the spec/CONTEXT/ADR formats, deep modules, red→green, and these pruning rules. Re-harvest by reading its CHANGELOG.md since the last diff, verifying against SKILL.md files; its issue-tracker machinery, wayfinder, and HTML reports stay rejected (out-of-scope.md). Harvests land lean: never grow the always-loaded tier (global-rules, AGENTS.md block, `rules/`) without shrinking it elsewhere.
