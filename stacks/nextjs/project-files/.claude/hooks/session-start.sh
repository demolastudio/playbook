#!/usr/bin/env bash
# Claude Code cloud sessions start from a fresh clone: fetch the gitignored
# playbook so AGENTS.md and the slash commands resolve, then install
# dependencies so the gates run. Local sessions skip this.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if [ ! -d .playbook ]; then
  git clone --quiet --depth 1 https://github.com/demolastudio/playbook.git .playbook
fi
mkdir -p .claude/commands
cp .playbook/workflows/*.md .claude/commands/

pnpm install
