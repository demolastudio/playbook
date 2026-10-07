# Checks — vinext + Cloudflare

Commands for the automated gates in `rules/definition-of-done.md`.
Prefer the project's own `package.json` scripts if they exist; these are the fallbacks.

| Gate | Command |
| ---- | ------- |
| Typecheck | `npx cf workers types && npx tsc --noEmit` |
| Lint | `npx oxlint` |
| Tests | `npx vitest run` |
| E2E (when present) | `npx playwright test` |
| Design (when `DESIGN.md` exists) | `bash scripts/check-design.sh` (`formats/design.md`) |
| Build (before deploy) | `npx vite build` |
| Post-deploy | the cache check below |

`cf workers types` regenerates the binding types in `.cloudflare/types` (include
that directory in `tsconfig.json`); a stale copy hides a missing binding.

The lint config, the deprecation gate, the prove-it-red step, and the optional
Claude Code hooks are shared with `stacks/nextjs/checks.md` — use them as they are.

## Post-Deploy Cache Check

Workers Cache isn't emulated locally, so the deploy isn't done until production
headers confirm it ([caching.md](./caching.md)). Save as
`scripts/check-cache.sh` and list the project's public and guarded routes:

```bash
#!/usr/bin/env bash
set -euo pipefail
base="$1"
cache_status() { curl -s -o /dev/null -D - "$base$1" | tr -d '\r' | awk -F': ' 'tolower($1)=="x-vinext-cache"{print $2}'; }
for path in / ; do
  cache_status "$path" >/dev/null
  case "$(cache_status "$path")" in HIT|UPDATING) ;; *) echo "public page not cached: $path"; exit 1 ;; esac
done
for path in /dashboard ; do
  case "$(cache_status "$path")" in HIT|UPDATING) echo "per-user page served from cache: $path"; exit 1 ;; esac
done
echo "cache check passed"
```
