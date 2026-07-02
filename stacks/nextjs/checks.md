# Checks — Next.js Stack

Commands for the automated gates in `rules/definition-of-done.md`.
Prefer the project's own `package.json` scripts if they exist; these are the fallbacks.

| Gate | Command |
| ---- | ------- |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx eslint .` |
| Tests | `npx vitest run` |
| E2E (when present) | `npx playwright test` |
| Build (before deploy) | `npx next build` |

## Optional: Automatic Enforcement (Claude Code Hooks)

Rules are probabilistic — the agent can skip them. Hooks are deterministic.
Two layers, add to the project's `.claude/settings.json`:

**1. PostToolUse — catch type errors the moment they happen** (fast feedback):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsc --noEmit --pretty false 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

**2. Stop — the definition-of-done gate, enforced** (the agent cannot finish
until the checks pass). Save as `.claude/hooks/done-gate.sh` and wire it to the
`Stop` event:

```bash
#!/usr/bin/env bash
input=$(cat)
if echo "$input" | grep -q '"stop_hook_active":true'; then exit 0; fi
errors=$(npx tsc --noEmit --pretty false 2>&1 | head -20)
if [ -n "$errors" ]; then
  echo "Definition-of-done gate failed — fix before finishing:" >&2
  echo "$errors" >&2
  exit 2
fi
```

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "bash .claude/hooks/done-gate.sh" }] }
    ]
  }
}
```

Gotchas: exit code 2 blocks (exit 1 is only a warning); the `stop_hook_active`
check prevents an infinite block loop. Extend the script with lint/tests once
typecheck-on-stop feels right for the project.
