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
- **Before proposing a direction change, check `out-of-scope.md`** — it exists so rejected ideas stay rejected until the reasons change.
