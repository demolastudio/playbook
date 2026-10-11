#!/usr/bin/env bash
# Claude Code cloud sessions start from a fresh clone: fetch the gitignored
# playbook so AGENTS.md, the slash commands, and the skills resolve, then
# install dependencies so the gates run. Local sessions skip this. A skill
# folder already in the clone is the project's own and stays.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if [ ! -d .playbook ]; then
  git clone --quiet --depth 1 https://github.com/demolastudio/playbook.git .playbook
fi
mkdir -p .claude/commands .claude/skills
cp .playbook/workflows/*.md .claude/commands/
for skill in .playbook/skills/*/; do
  [ -f "$skill/SKILL.md" ] || continue
  [ -e ".claude/skills/$(basename "$skill")" ] || cp -R "${skill%/}" .claude/skills/
done

pnpm install
