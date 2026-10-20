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

# History first: an older grill.md and a since-deleted workflow, so the
# legacy cleanup below meets copies that only match an earlier version.
mkdir -p "$work/repo/workflows"
git -C "$work/repo" init -q
{ cat "$root/workflows/grill.md"; echo "an older version"; } > "$work/repo/workflows/grill.md"
echo "a retired workflow" > "$work/repo/workflows/retired.md"
git -C "$work/repo" add -A
git -C "$work/repo" -c user.name=test -c user.email=test@example.invalid commit -q -m older
git -C "$work/repo" rm -q -r workflows
(cd "$root" && git ls-files -z --cached --others --exclude-standard | xargs -0 tar -cf - 2>/dev/null) | tar -xf - -C "$work/repo"
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
grep -qF "Monorepo: no guardrail files copied" "$p.log" || fail "turbo: missing-guardrails warning not printed"

# Claude Code and Cursor only; an earlier install's Antigravity copies go,
# a user's own file there stays
p="$work/legacy"
mkdir -p "$p/.agents/workflows" "$p/.agent/rules" "$p/.agents/rules"
cp "$root/workflows/flow.md" "$p/.agents/workflows/flow.md"
{ cat "$root/workflows/grill.md"; echo "an older version"; } > "$p/.agents/workflows/grill.md"
mkdir -p "$p/.agent/workflows" && echo "a retired workflow" > "$p/.agent/workflows/retired.md"
echo "mine" > "$p/.agents/workflows/team-flow.md"
printf 'rules\n\nProject routing and completion gate: see AGENTS.md at the project root.\n' > "$p/.agent/rules/playbook.md"
echo "mine" > "$p/.agents/rules/team.md"
run_setup "$p"
expect_file "$p" .claude/commands/flow.md
expect_file "$p" .cursor/commands/flow.md
expect_file "$p" .cursor/rules/playbook.mdc
expect_no_file "$p" .agent
expect_no_file "$p" .agents/workflows/flow.md
expect_no_file "$p" .agents/workflows/grill.md
expect_file "$p" .agents/workflows/team-flow.md
expect_file "$p" .agents/rules/team.md
grep -q "agent" "$p/.gitignore" && fail "legacy: .gitignore gained Antigravity entries"

# skills: every playbook skill lands whole and gitignored; a project's own
# skill survives a name clash; a skill the playbook dropped is removed
p="$work/skills"
mkdir -p "$p/.claude/skills/break-ui" "$p/.claude/skills/team-skill" "$p/.claude/skills/retired-skill"
echo "mine" > "$p/.claude/skills/break-ui/SKILL.md"
echo "team" > "$p/.claude/skills/team-skill/SKILL.md"
echo "old" > "$p/.claude/skills/retired-skill/SKILL.md"
echo "retired-skill" > "$p/.claude/skills/.playbook-skills"
run_setup "$p"
for dir in "$root"/skills/*/; do
  name="$(basename "$dir")"
  [ "$name" = "break-ui" ] && continue
  diff -r "$dir" "$p/.claude/skills/$name" > /dev/null || fail "skills: .claude/skills/$name differs from skills/$name"
  grep -qxF ".claude/skills/$name/" "$p/.gitignore" || fail "skills: $name not gitignored"
done
grep -qxF "mine" "$p/.claude/skills/break-ui/SKILL.md" || fail "skills: overwrote the project's own break-ui"
grep -qxF "break-ui" "$p/.claude/skills/.playbook-skills" && fail "skills: manifest claims the project's own break-ui"
expect_file "$p" .claude/skills/team-skill/SKILL.md
expect_no_file "$p" .claude/skills/retired-skill
grep -qF "kept your .claude/skills/break-ui" "$p.log" || fail "skills: name clash not reported"
echo "stale" >> "$p/.claude/skills/emil-design-eng/SKILL.md"
run_setup "$p"
diff -r "$root/skills/emil-design-eng" "$p/.claude/skills/emil-design-eng" > /dev/null || fail "skills re-run: installed skill not refreshed"
grep -qF "kept your .claude/skills/emil-design-eng" "$p.log" && fail "skills re-run: treated its own install as the project's"

# --all re-runs setup only where setup ran before
root_all="$work/all"
mkdir -p "$root_all/one" "$root_all/group/two" "$root_all/fresh" "$root_all/one/node_modules/pkg/.playbook"
run_setup "$root_all/one"
run_setup "$root_all/group/two"
rm "$root_all/one/AGENTS.md" "$root_all/group/two/AGENTS.md"
bash "$root/setup.sh" --all "$root_all" > "$root_all.log" 2>&1 || { cat "$root_all.log"; fail "all: exited non-zero"; }
expect_file "$root_all" one/AGENTS.md
expect_file "$root_all" group/two/AGENTS.md
expect_no_file "$root_all" fresh/AGENTS.md
expect_no_file "$root_all" fresh/.playbook
expect_no_file "$root_all" one/node_modules/pkg/AGENTS.md
grep -qF "Updated 2 project(s)" "$root_all.log" || fail "all: summary missing or wrong count"

# the home folder is refused and left untouched
h="$work/home"
mkdir "$h"
(cd "$h" && HOME="$h" bash "$root/setup.sh" . > "$h.log" 2>&1) && fail "home: setup.sh ran in the home folder"
[ -z "$(ls -A "$h")" ] || fail "home: setup.sh wrote into the home folder"

# --global adds the git guard once, keeps other settings, and the guard blocks
g="$work/global-home"
mkdir -p "$g/.claude"
echo '{"model":"opus"}' > "$g/.claude/settings.json"
HOME="$g" bash "$root/setup.sh" --global > "$g.log" 2>&1 || fail "global: setup.sh --global failed"
HOME="$g" bash "$root/setup.sh" --global > "$g.log" 2>&1 || fail "global: second run failed"
node -e 'const s=require(process.argv[1]); if (s.model !== "opus" || s.hooks.PreToolUse.length !== 1) process.exit(1)' "$g/.claude/settings.json" || fail "global: settings lost or guard registered twice"
guard() { printf '{"tool_input":{"command":"%s"}}' "$1" | node "$g/.claude/hooks/playbook-git-guard.mjs" 2>/dev/null; }
guard "git reset --hard" && fail "guard: git reset --hard not blocked"
guard "git push origin main" || fail "guard: git push blocked"

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
