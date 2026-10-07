# Maintenance Invariants

> Rules for editing THIS repo. Break one and something downstream silently rots.

- **New chapter → INDEX row.** Every playbook chapter gets a routing-table row in its domain's INDEX.md, in the same change.
- **New or renamed workflow → update `workflows/flow.md`.** A router that lies is worse than no router.
- **Budgets:** rule files < 50 lines; chapters ~150 target, 200 hard max (split when over); INDEXes route, they never teach.
- **One rule, one home.** `rules/global-rules.md` is canonical. After changing it: re-run `setup.sh --global` and re-paste into Cursor.
- **Stack-specific content never goes in `rules/`, `workflows/`, or core chapters** — it belongs in `stacks/<stack>/`; agnostic files may cite a stack only as a labeled example.
- **A stack may inherit another stack's sections by name** (`vinext-cloudflare` inherits `nextjs`); the inheriting STACK.md names the sections and states that it wins on conflict. Never copy an inherited section.
- **Gate before gotcha.** If a linter, typecheck, test, or script can catch a mistake, enable that check (stack `checks.md`) instead of writing it down. Gotchas hold only what no tool reports, each tagged with the version it was seen on — an upgrade re-verifies or deletes it.
- **Bump the freshness baselines in the same change.** The monthly check (`.github/workflows/playbook-freshness.yml`) compares npm against `scripts/tracked-packages.json` — the one home for the versions this playbook was last verified on — and upstream against the harvest date below. Re-verify a package or harvest upstream, then bump them, or the next report repeats itself. A newly cited package gets an entry.
- **Templates compile.** Every `stacks/*/templates/` file typechecks against the stack's pinned versions before it lands; an upgrade that breaks one fixes it in the same change.
- **Everything in `workflows/` becomes a slash command** (setup.sh copies it flat). Format templates and reference docs go in `formats/`, never in `workflows/`.
- **Workflow files must survive being copied out of the repo:** reference `.playbook/...` paths, never repo-relative links; frontmatter descriptions single-line, trigger-style, no double quotes (the Cursor .mdc conversion wraps them in quotes).
- **Prune with the no-op test:** per sentence, ask "does this change behavior versus the model's default?" If not, delete the sentence — don't trim it.
- **Don't cache the environment.** `package.json` scripts, config files, `--help` output, and installed package docs are sources of truth; a file that restates them is a stale copy waiting to happen. Point at the lookup; write down only what no lookup reveals (the reason behind a choice, the convention nobody encoded, the trap no tool reports).
- **Anchor on leading words.** Prefer one strong pretrained concept the agent thinks with (*tight* loop, *red*, *seam*, *deep* module) over a restated triad ("fast, deterministic, low-overhead"). Fewer tokens, sharper behavior.
- **Prompt the positive.** State the target behavior instead of prohibiting the wrong one ("don't X" makes X more available, not less). Keep a prohibition only when it can't be phrased positively, and pair it with what to do instead.
- **Workflow descriptions: one trigger per branch.** Synonyms restating the same trigger are duplication — collapse them; keep only genuinely distinct entry conditions.
- **Before proposing a direction change, check `out-of-scope.md`** — it exists so rejected ideas stay rejected until the reasons change.
- **Upstream harvest source: `github.com/mattpocock/skills`** (last diffed 2026-10-07, at 1.3.1 plus unreleased changesets) — origin of /grill's frontier rounds, /debug, /review's two axes + smells, /prototype, /merge-conflicts, the phase-boundary tree, the spec/CONTEXT/ADR formats, deep modules, red→green, and these pruning rules. Re-harvest by reading its CHANGELOG.md and `.changeset/` since the last diff, verifying against SKILL.md files; its issue-tracker machinery, wayfinder, HTML reports, and the other rejections in out-of-scope.md stay rejected. Harvests land lean: never grow the always-loaded tier (global-rules, AGENTS.md block, `rules/`) without shrinking it elsewhere.
