## CI/CD & Gate Layering

> How the definition-of-done gates get AUTOMATED — locally on commit, remotely
> on every PR, and before every deploy. Stack mechanics (husky, lint-staged,
> GitHub Actions): `stacks/<stack>/ci-cd.md`. Go-live checklist: [deployment.md](./deployment.md).

### The Three Gate Layers

The same gates run three times, at increasing thoroughness and decreasing forgiveness:

| Layer | Runs | Scope | Speed budget | Can be bypassed? |
| ----- | ---- | ----- | ------------ | ---------------- |
| **Git hooks** (pre-commit / pre-push) | On the dev machine | Staged files / changed scope | Commit < 5s, push < 60s | Yes (`--no-verify`) — it's a courtesy layer |
| **CI pipeline** | On every PR + main | Full definition-of-done gates + build | < 10 min | **No — the enforcement of record** |
| **Deploy gates** | Before production | Build artifact + env validation + [deployment.md](./deployment.md) checklist | — | No |

The layering exists because of one truth: **local hooks are convenience, CI is law.** Anyone (including an agent) can skip a local hook; a branch-protected CI check cannot be skipped. Never treat a passing pre-commit as proof — the PR is green when CI says so.

### What Runs Where

| Gate | Pre-commit | Pre-push | CI |
| ---- | ---------- | -------- | -- |
| Format + lint (staged files only) | ✅ auto-fix | — | ✅ full repo, no fixes |
| Typecheck | too slow | ✅ | ✅ |
| Unit/integration tests | too slow | ✅ affected | ✅ full suite |
| Production build | never | never | ✅ |
| E2E | never | never | ✅ on preview deploys |

Pre-commit stays under ~5 seconds or developers rage-bypass it — staged-file linting only. Everything heavier moves right.

### Lifecycle Scripts (predev / prebuild)

Package managers run `pre<script>` hooks automatically — use them to **fail fast on misconfiguration** instead of debugging a broken runtime:

| Script | Job |
| ------ | --- |
| `predev` | Validate env vars against the schema before the dev server starts — a missing `STRIPE_WEBHOOK_SECRET` fails in 1 second, not 20 minutes into testing |
| `prebuild` | Same validation before any build — CI and deploys fail immediately on bad config |
| `prepare` | Install git hooks so every clone gets them automatically |
| `postinstall` | Generate ORM clients / build artifacts the code expects to exist |

Rule: **anything the app assumes at runtime gets asserted in a lifecycle script.** Env schema validation (see [deployment.md](./deployment.md)) is the canonical case.

### CI Pipeline Shape

```
PR opened/updated
  → install (cached)
  → lint + typecheck (parallel)
  → tests (unit + integration, DB service container)
  → production build
  → E2E against the preview deploy (critical paths only)
Merge to main → deploy → post-deploy verification (deployment.md)
```

- **Branch protection on main**: PRs only, required checks green, no force-push. This is what makes CI the enforcement of record.
- Cache dependencies and build artifacts — a 10-minute pipeline gets bypassed culturally just like a slow pre-commit.
- CI runs the SAME commands as `stacks/<stack>/checks.md` — one source of truth for what "passing" means; the pipeline just invokes it.

### Dependency Updates — Scheduled, Gated, Delayed

Updates arrive as pull requests on a schedule and pass the same gates as any change. Nothing upgrades by accident on a laptop.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule: { interval: "weekly" }
    cooldown: { default-days: 3, semver-major-days: 14 }
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule: { interval: "monthly" }
```

- **Majors arrive ungrouped** — each is a reviewed decision with its changelog read, never a batch merge.
- **Security updates skip the schedule and the cooldown.** The cooldown delays fresh releases because compromised versions are usually caught within days.
- **pnpm enforces the same delay at install** — set it explicitly so CI fails instead of silently excluding (an explicit value turns on strict mode):
  ```yaml
  # pnpm-workspace.yaml
  minimumReleaseAge: 1440    # minutes
  trustPolicy: no-downgrade  # refuse a version published with weaker provenance than earlier ones
  ```
- **Prerelease dependencies are pinned exactly** and still move through update PRs.
- If Dependabot can't update the project's lockfile format yet, Renovate covers the same schedule, grouping, and release-age delay.

### Rules

- **CI is the definition-of-done, enforced remotely.** Local green is a hint; CI green is the fact.
- **Pre-commit < 5 seconds.** Staged files only, auto-fix allowed.
- **Fail fast on config** — `predev`/`prebuild` assert the environment before anything runs.
- **Same commands everywhere.** Hooks, CI, and agents all run the checks.md commands — never parallel definitions of "passing".
- **Dependencies change only through scheduled update PRs** that pass the gates.
- **Never merge red, never deploy amber.** A flaky test is fixed or quarantined with an issue — not re-run until green.
