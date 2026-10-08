#!/usr/bin/env bash
# Runs setup.sh against throwaway projects and checks what lands in them.
# setup.sh clones its repo, so this commits the working tree to a temp repo
# and points PLAYBOOK_REPO_URL at it — uncommitted edits are tested too.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
failures=0

fail() { echo "FAIL: $*"; failures=$((failures + 1)); }
expect_file() { [ -f "$1/$2" ] || fail "$(basename "$1"): missing $2"; }
expect_no_file() { [ ! -e "$1/$2" ] || fail "$(basename "$1"): unexpected $2"; }
expect_same() { cmp -s "$1/$2" "$3" || fail "$(basename "$1"): $2 differs from ${3#"$root"/}"; }
expect_exec() { [ -x "$1/$2" ] || fail "$(basename "$1"): $2 not executable"; }

mkdir "$work/repo"
(cd "$root" && git ls-files -z --cached --others --exclude-standard | xargs -0 tar -cf - 2>/dev/null) | tar -xf - -C "$work/repo"
git -C "$work/repo" init -q
git -C "$work/repo" add -A
git -C "$work/repo" -c user.name=test -c user.email=test@example.invalid commit -q -m snapshot
export PLAYBOOK_REPO_URL="$work/repo"

run_setup() { bash "$root/setup.sh" "$1" > "$1.log" 2>&1 || { cat "$1.log"; fail "$(basename "$1"): setup.sh exited non-zero"; }; }
next_files="$root/stacks/nextjs/project-files"
vinext_files="$root/stacks/vinext-cloudflare/project-files"

# vinext: own files plus inherited Next.js files; its pnpm-workspace.yaml wins
p="$work/vinext"
mkdir "$p" && echo '{ "dependencies": { "vinext": "1.0.1" } }' > "$p/package.json"
run_setup "$p"
for f in .oxlintrc.json vitest.config.mts .github/workflows/gates.yml .github/dependabot.yml .claude/settings.json scripts/check-design.sh; do
  expect_same "$p" "$f" "$next_files/$f"
done
expect_same "$p" pnpm-workspace.yaml "$vinext_files/pnpm-workspace.yaml"
expect_same "$p" scripts/check-cache.sh "$vinext_files/scripts/check-cache.sh"
for f in .claude/hooks/session-start.sh scripts/check-design.sh scripts/check-cache.sh; do expect_exec "$p" "$f"; done
grep -q "differs from" "$p.log" && fail "vinext: inherited file reported as differing"
grep -qxF "@AGENTS.md" "$p/CLAUDE.md" || fail "vinext: CLAUDE.md lacks @AGENTS.md"
grep -qF "stacks/vinext-cloudflare/STACK.md" "$p/AGENTS.md" || fail "vinext: AGENTS.md lacks the stack"

grep -qF "installs with pnpm 11+" "$p.log" || fail "vinext: no pnpm warning without a lockfile"

# re-run with pnpm pinned: nothing copied, nothing reported, no warning
echo '{ "packageManager": "pnpm@11.28.5", "dependencies": { "vinext": "1.0.1" } }' > "$p/package.json"
touch "$p/pnpm-lock.yaml"
run_setup "$p"
grep -qE '^   (\+|↷) ' "$p.log" && fail "vinext re-run: reported files"
grep -qF "installs with pnpm 11+" "$p.log" && fail "vinext re-run: pnpm warning despite pin and lockfile"

# Next.js with an existing Claude Code settings file: kept and reported
p="$work/next"
mkdir -p "$p/.claude" && echo '{ "dependencies": { "next": "16.4.0" } }' > "$p/package.json"
echo '{ "permissions": { "allow": [] } }' > "$p/.claude/settings.json"
cp "$p/.claude/settings.json" "$work/settings.before"
run_setup "$p"
expect_same "$p" .claude/settings.json "$work/settings.before"
grep -qF "kept your .claude/settings.json" "$p.log" || fail "next: kept settings not reported"
expect_same "$p" pnpm-workspace.yaml "$next_files/pnpm-workspace.yaml"
expect_file "$p" .claude/hooks/session-start.sh
expect_file "$p" vitest.config.mts
expect_no_file "$p" scripts/check-cache.sh

# Turborepo: app stacks under apps/ are routed, guardrails stay root-only
p="$work/turbo"
mkdir -p "$p/apps/web" "$p/apps/api" && echo '{}' > "$p/turbo.json" && echo '{ "devDependencies": { "turbo": "2.0.0" } }' > "$p/package.json"
echo '{ "dependencies": { "next": "16.4.0" } }' > "$p/apps/web/package.json"
echo 'dependencies = ["fastapi"]' > "$p/apps/api/pyproject.toml"
run_setup "$p"
grep -qF "stacks/turborepo/STACK.md" "$p/AGENTS.md" || fail "turbo: AGENTS.md lacks turborepo"
grep -q "stacks/nextjs/STACK.md.* for .apps/web/" "$p/AGENTS.md" || fail "turbo: AGENTS.md lacks nextjs for apps/web"
grep -q "stacks/fastapi/STACK.md.* for .apps/api/" "$p/AGENTS.md" || fail "turbo: AGENTS.md lacks fastapi for apps/api"
expect_no_file "$p" .github/workflows/gates.yml

# Claude Code and Cursor only; an earlier install's Antigravity copies go,
# a user's own file there stays
p="$work/legacy"
mkdir -p "$p/.agents/workflows" "$p/.agent/rules" "$p/.agents/rules"
cp "$root/workflows/flow.md" "$p/.agents/workflows/flow.md"
printf 'rules\n\nProject routing and completion gate: see AGENTS.md at the project root.\n' > "$p/.agent/rules/playbook.md"
echo "mine" > "$p/.agents/rules/team.md"
run_setup "$p"
expect_file "$p" .claude/commands/flow.md
expect_file "$p" .cursor/commands/flow.md
expect_file "$p" .cursor/rules/playbook.mdc
expect_no_file "$p" .agent
expect_no_file "$p" .agents/workflows
expect_file "$p" .agents/rules/team.md
grep -q "agent" "$p/.gitignore" && fail "legacy: .gitignore gained Antigravity entries"

# a stack without shipped files gets none, and no next-step note
p="$work/fastapi"
mkdir "$p" && echo 'dependencies = ["fastapi"]' > "$p/pyproject.toml"
run_setup "$p"
expect_no_file "$p" .github/workflows/gates.yml
grep -qE "Guardrail files|gate scripts" "$p.log" && fail "fastapi: guardrail output printed"
expect_file "$p" AGENTS.md

if [ "$failures" -gt 0 ]; then
  echo "$failures setup check(s) failed"
  exit 1
fi
echo "setup checks passed"
