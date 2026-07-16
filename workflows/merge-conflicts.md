---
description: Use when an in-progress git merge or rebase has conflict hunks to resolve
---

# Merge Conflicts

Resolve an in-progress merge or rebase by **intent**, hunk by hunk. Never `--abort`; never invent new behaviour.

## Process

1. **See the state.** Which operation is in progress, which files conflict, what each side's history looks like (`git status`, `git log --merge`, the conflicting hunks).
2. **Find each side's primary source.** Why was each change made? Read the commit messages, linked PRs/issues, and surrounding code until both intents are understood — a resolution without both intents is a guess.
3. **Resolve each hunk by intent.** Preserve both intents where possible. Where they're incompatible, pick the side matching the merge's stated goal and name the trade-off to the user. Never write behaviour that neither side had.
4. **Run the gates.** The stack's checks from `.playbook/rules/definition-of-done.md` — fix anything the merge broke before continuing.
5. **Finish the operation.** Stage and commit the merge; if rebasing, continue until every commit is replayed.

## Rules

- **Always resolve, never abort** — an abort throws away the analysis and leaves the branch stuck.
- **Both intents or a named trade-off** — silent half-merges resurface as regressions.
- **The gates decide done**, not "the conflicts markers are gone".
