#!/usr/bin/env bash
# playbook setup script (demolastudio/playbook)
# Clones the playbook into .playbook/, detects the project stack,
# and generates an AGENTS.md that all AGENTS.md-aware tools read.
#
# Usage:
#   bash setup.sh /path/to/project             ← project setup (re-run any time:
#                                                 refreshes the AGENTS.md managed block,
#                                                 always-on rule files, and workflows)
#   bash setup.sh /path/to/project --global    ← project setup + global rules
#   bash setup.sh --global                     ← update global rules only (no project setup)

set -euo pipefail

# ─── Parse args ────────────────────────────────────────────────────
INSTALL_GLOBAL=false
PROJECT_DIR=""

for arg in "$@"; do
  case "$arg" in
    --global) INSTALL_GLOBAL=true ;;
    --force) ;; # accepted for older instructions; nothing reads it
    *) PROJECT_DIR="$arg" ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_URL="${PLAYBOOK_REPO_URL:-https://github.com/demolastudio/playbook.git}"

# ─── Helpers ───────────────────────────────────────────────────────

install_global_rules() {
  local rules_file="$1"
  if [ ! -f "$rules_file" ]; then
    echo "   ❌ Error: $rules_file not found"
    exit 1
  fi

  echo "🌍 Updating global rules for all AI tools..."

  mkdir -p "$HOME/.claude"
  cp "$rules_file" "$HOME/.claude/CLAUDE.md"
  echo "   ✅ Claude Code  → ~/.claude/CLAUDE.md"

  mkdir -p "$HOME/.gemini"
  cp "$rules_file" "$HOME/.gemini/GEMINI.md"
  echo "   ✅ Gemini CLI   → ~/.gemini/GEMINI.md"
  echo "      💡 Tip: add \"AGENTS.md\" to context.fileName in ~/.gemini/settings.json"
  echo "         so Gemini CLI also reads project AGENTS.md files."

  mkdir -p "$HOME/.codex"
  cp "$rules_file" "$HOME/.codex/AGENTS.md"
  echo "   ✅ OpenAI Codex → ~/.codex/AGENTS.md"

  echo ""
  echo "   ⚠️  Cursor: paste rules/global-rules.md into Settings → Rules for AI"
}

copy_if_newer() {
  local src="$1" dest="$2"
  if [ ! -f "$dest" ] || [ "$src" -nt "$dest" ]; then
    cp "$src" "$dest"
  fi
}

strip_frontmatter() {
  awk 'NR==1 && $0=="---" {infm=1; next}
       infm && $0=="---" {infm=0; next}
       infm {next}
       {print}' "$1"
}

add_gitignore_entry() {
  local gitignore="$1" entry="$2"
  if [ ! -f "$gitignore" ]; then
    echo "$entry" > "$gitignore"
  elif ! grep -qxF "$entry" "$gitignore"; then
    echo "$entry" >> "$gitignore"
  fi
}

# ─── Global-only mode (no project dir) ────────────────────────────
if [ "$INSTALL_GLOBAL" = true ] && [ -z "$PROJECT_DIR" ]; then
  install_global_rules "$SCRIPT_DIR/rules/global-rules.md"
  echo ""
  echo "✅ Global rules updated."
  exit 0
fi

# ─── Project setup mode ───────────────────────────────────────────
PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
PLAYBOOK_DIR="$PROJECT_DIR/.playbook"

echo "🔧 Setting up playbook in $PROJECT_DIR"

if [ -d "$PLAYBOOK_DIR" ]; then
  echo "📦 Playbook already exists. Pulling latest..."
  git -C "$PLAYBOOK_DIR" remote set-url origin "$REPO_URL"
  git -C "$PLAYBOOK_DIR" pull --quiet
else
  echo "📥 Cloning playbook..."
  git clone --quiet "$REPO_URL" "$PLAYBOOK_DIR"
fi

# ─── Detect project stacks ─────────────────────────────────────────
STACKS=()
PKG_JSON="$PROJECT_DIR/package.json"

if [ -f "$PROJECT_DIR/turbo.json" ]; then
  STACKS+=("turborepo")
fi
if [ -f "$PKG_JSON" ] && grep -q '"vinext"' "$PKG_JSON"; then
  STACKS+=("vinext-cloudflare")
elif [ -f "$PKG_JSON" ] && grep -q '"next"' "$PKG_JSON"; then
  STACKS+=("nextjs")
fi
if [ -f "$PKG_JSON" ] && grep -q '"@nestjs/core"' "$PKG_JSON"; then
  STACKS+=("nestjs")
fi
if grep -qs "fastapi" "$PROJECT_DIR/pyproject.toml" "$PROJECT_DIR"/requirements*.txt 2>/dev/null; then
  STACKS+=("fastapi")
fi

if [ ${#STACKS[@]} -gt 0 ]; then
  echo "🔍 Detected stack(s): ${STACKS[*]}"
else
  echo "🔍 No known stack detected — AGENTS.md will list available profiles."
fi

# ─── Gitignore playbook artifacts ──────────────────────────────────
GITIGNORE="$PROJECT_DIR/.gitignore"
for entry in ".playbook/" ".agents/workflows/" ".agent/workflows/" ".agents/rules/playbook.md" ".agent/rules/playbook.md" ".claude/commands/" ".cursor/commands/" ".cursor/rules/playbook.mdc"; do
  add_gitignore_entry "$GITIGNORE" "$entry"
done
echo "📋 Ensured playbook artifacts are gitignored"

# ─── Copy workflows to all AI tool paths ──────────────────────────
# Workflows are user-invoked slash commands in every tool. Cursor reads
# commands from .cursor/commands/ (plain Markdown); earlier installs wrote
# them as .cursor/rules/<workflow>.mdc, which Cursor could auto-attach —
# a file is removed only if it has that generated shape (agent-requested
# rule carrying the workflow's own title), never a user's own rule.
WORKFLOWS_SRC="$PLAYBOOK_DIR/workflows"

if [ -d "$WORKFLOWS_SRC" ]; then
  mkdir -p "$PROJECT_DIR/.agents/workflows" "$PROJECT_DIR/.agent/workflows" \
           "$PROJECT_DIR/.claude/commands" "$PROJECT_DIR/.cursor/commands" \
           "$PROJECT_DIR/.cursor/rules"

  for f in "$WORKFLOWS_SRC"/*.md; do
    [ -f "$f" ] || continue
    name="$(basename "$f")"
    copy_if_newer "$f" "$PROJECT_DIR/.agents/workflows/$name"
    copy_if_newer "$f" "$PROJECT_DIR/.agent/workflows/$name"
    copy_if_newer "$f" "$PROJECT_DIR/.claude/commands/$name"

    target="$PROJECT_DIR/.cursor/commands/$name"
    if [ ! -f "$target" ] || [ "$f" -nt "$target" ]; then
      strip_frontmatter "$f" > "$target"
    fi
    legacy="$PROJECT_DIR/.cursor/rules/${name%.md}.mdc"
    title="$(grep -m1 '^# ' "$f" || true)"
    if [ -f "$legacy" ] && [ -n "$title" ] && grep -qxF "alwaysApply: false" "$legacy" && grep -qxF "$title" "$legacy"; then
      rm "$legacy"
    fi
  done

  echo "📂 Antigravity  → .agents/workflows/ (+ .agent/ for older versions)"
  echo "📂 Claude Code  → .claude/commands/"
  echo "📂 Cursor       → .cursor/commands/"
fi

# ─── Always-loaded rules per tool ──────────────────────────────────
# Antigravity workspace rules (plain Markdown, auto-loaded; .agents/ is
# current, .agent/ kept for older versions) and a Cursor always-apply rule.
# Both are rendered from rules/global-rules.md — one source of truth,
# refreshed on every setup run.
GLOBAL_RULES_SRC="$PLAYBOOK_DIR/rules/global-rules.md"

for rules_dir in "$PROJECT_DIR/.agents/rules" "$PROJECT_DIR/.agent/rules"; do
  mkdir -p "$rules_dir"
  {
    cat "$GLOBAL_RULES_SRC"
    echo ""
    echo "Project routing and completion gate: see AGENTS.md at the project root."
  } > "$rules_dir/playbook.md"
done
echo "📌 Antigravity  → .agents/rules/playbook.md (always-loaded, + .agent/ fallback)"

{
  echo "---"
  echo "description: \"Playbook global rules — always apply\""
  echo "alwaysApply: true"
  echo "---"
  echo ""
  cat "$GLOBAL_RULES_SRC"
} > "$PROJECT_DIR/.cursor/rules/playbook.mdc"
echo "📌 Cursor       → .cursor/rules/playbook.mdc (alwaysApply: true)"

# ─── Generate / merge AGENTS.md ────────────────────────────────────
# Managed-block upsert: our content lives between HTML-comment markers.
# Existing AGENTS.md content (e.g. generated by create-next-app) is never
# touched; re-runs refresh only the marked block. Legacy my-playbook
# markers (pre-2026-07 installs) are recognized and migrated on refresh.
AGENTS_FILE="$PROJECT_DIR/AGENTS.md"
BLOCK_FILE="$(mktemp)"

{
  cat << 'EOF'
<!-- playbook:start -->
# Project Instructions for AI Agents

## Core Principles — apply to EVERY change

1. **Single Source of Truth** — one function per business rule, defined once, called from everywhere.
2. **Database as Safety Net** — application logic validates first, DB constraints are the final defence.
3. **Never Trust the Client** — re-validate all inputs server-side; authenticate and authorize all mutations.
4. **Audit Everything** — every state transition, charge, and permission change gets logged. Append-only.
5. **Idempotency by Default** — every external side effect uses a business-derived idempotency key.
6. **Money Is Integer Minor Units** — never floats; the currency travels with every amount; rounding happens once, in one named function.

## Required Reading, in Order

1. `.playbook/rules/` — global-rules, code-style, project-structure, mistakes, definition-of-done
2. `CONTEXT.md` at the project root, if it exists — the domain glossary; use its exact terms in all naming
3. `DESIGN.md` at the project root, if it exists — the design lock; read it before any UI work
EOF

    step=4
    if [ ${#STACKS[@]} -gt 0 ]; then
      for stack in "${STACKS[@]}"; do
        echo "$step. \`.playbook/stacks/$stack/STACK.md\` — stack conventions, templates, and check commands"
        step=$((step + 1))
      done
    else
      echo "$step. \`.playbook/stacks/\` — identify the closest profile (vinext-cloudflare, nextjs, nestjs, fastapi, turborepo) and read its STACK.md; if none fits, proceed with the agnostic rules only"
      step=$((step + 1))
    fi

    echo "$step. \`.playbook/playbooks/<domain>/INDEX.md\` — for the relevant domain (e.g. \`booking\`, \`core\`)"
    step=$((step + 1))
    echo "$step. \`.playbook/recommended-skills.md\` — install any relevant package skills"

    cat << 'EOF'

## Workflows

`.playbook/workflows/flow.md` maps the available workflows (installed as slash commands) — consult it when unsure how to proceed.

## Completion Gate

A task is complete ONLY when `.playbook/rules/definition-of-done.md` passes.
Run the stack's check commands and report actual output.

NEVER guess on architecture or naming. Consult the playbook first.
<!-- playbook:end -->
EOF
} > "$BLOCK_FILE"

if [ ! -f "$AGENTS_FILE" ]; then
  cat "$BLOCK_FILE" > "$AGENTS_FILE"
  echo "📝 Created AGENTS.md"
elif grep -qE "<!-- (my-)?playbook:start -->" "$AGENTS_FILE"; then
  awk -v blockfile="$BLOCK_FILE" '
    /<!-- (my-)?playbook:start -->/ {
      skip = 1
      while ((getline line < blockfile) > 0) print line
      close(blockfile)
      next
    }
    /<!-- (my-)?playbook:end -->/ { skip = 0; next }
    !skip { print }
  ' "$AGENTS_FILE" > "$AGENTS_FILE.tmp" && mv "$AGENTS_FILE.tmp" "$AGENTS_FILE"
  echo "📝 Refreshed the playbook block in AGENTS.md (rest untouched)"
else
  { echo ""; cat "$BLOCK_FILE"; } >> "$AGENTS_FILE"
  echo "📝 Appended the playbook block to your existing AGENTS.md (content preserved)"
fi

rm -f "$BLOCK_FILE"

# ─── Claude Code: make sure it reads AGENTS.md ────────────────────
# Claude Code reads AGENTS.md only when no CLAUDE.md exists (and only on
# recent versions). A one-line @-import in CLAUDE.md covers both cases.
CLAUDE_FILE="$PROJECT_DIR/CLAUDE.md"
if [ ! -f "$CLAUDE_FILE" ]; then
  echo "@AGENTS.md" > "$CLAUDE_FILE"
  echo "📝 Created CLAUDE.md importing AGENTS.md"
elif ! grep -qxF "@AGENTS.md" "$CLAUDE_FILE"; then
  { echo ""; echo "@AGENTS.md"; } >> "$CLAUDE_FILE"
  echo "📝 Added @AGENTS.md import to your existing CLAUDE.md (content preserved)"
fi

# ─── Global rules (if --global passed with a project dir) ─────────
if [ "$INSTALL_GLOBAL" = true ]; then
  echo ""
  install_global_rules "$PLAYBOOK_DIR/rules/global-rules.md"
fi

# ─── Guardrail files (copied once, never overwritten) ─────────────
# stacks/<stack>/project-files/ mirrors project paths: lint config, the CI
# gates workflow, Dependabot, pnpm supply-chain policy, Claude Code settings
# and SessionStart hook, check scripts. The stack's own files win over the
# files of the stack it inherits (stacks/<stack>/inherits).
copy_project_files() {
  local src="$1" overridden_by="${2:-}"
  [ -d "$src" ] || return 0
  while IFS= read -r rel; do
    rel="${rel#./}"
    if [ -n "$overridden_by" ] && [ -e "$overridden_by/$rel" ]; then
      continue
    elif [ ! -e "$PROJECT_DIR/$rel" ]; then
      mkdir -p "$(dirname "$PROJECT_DIR/$rel")"
      cp "$src/$rel" "$PROJECT_DIR/$rel"
      echo "   + $rel"
    elif ! cmp -s "$src/$rel" "$PROJECT_DIR/$rel"; then
      echo "   ↷ kept your $rel — differs from .playbook/${src#"$PLAYBOOK_DIR"/}/$rel"
    fi
  done < <(cd "$src" && find . -type f | sort)
}

GUARDRAIL_STACK=""
if [ ${#STACKS[@]} -gt 0 ]; then
  for stack in "${STACKS[@]}"; do
    [ -d "$PLAYBOOK_DIR/stacks/$stack/project-files" ] || [ -f "$PLAYBOOK_DIR/stacks/$stack/inherits" ] || continue
    if [ -z "$GUARDRAIL_STACK" ]; then
      echo "🛡️  Guardrail files:"
      GUARDRAIL_STACK="$stack"
    fi
    copy_project_files "$PLAYBOOK_DIR/stacks/$stack/project-files"
    if [ -f "$PLAYBOOK_DIR/stacks/$stack/inherits" ]; then
      copy_project_files "$PLAYBOOK_DIR/stacks/$(cat "$PLAYBOOK_DIR/stacks/$stack/inherits")/project-files" \
        "$PLAYBOOK_DIR/stacks/$stack/project-files"
    fi
  done
fi

# ─── Done ──────────────────────────────────────────────────────────
echo ""
echo "✅ Done! Your playbook is set up."
echo ""
if [ -n "$GUARDRAIL_STACK" ]; then
  echo "   Next: add the gate scripts to package.json (typecheck, lint, test, build —"
  echo "   see .playbook/stacks/$GUARDRAIL_STACK/checks.md), then on GitHub require the"
  echo "   \"gates\" check before merging to main."
  if [ ! -f "$PROJECT_DIR/pnpm-lock.yaml" ] || ! grep -qE '"(packageManager": *"pnpm@|devEngines")' "$PKG_JSON"; then
    echo "   ⚠️  gates.yml installs with pnpm 11+: commit a pnpm-lock.yaml and pin"
    echo "      \"packageManager\": \"pnpm@<version>\" in package.json."
  fi
  echo ""
fi
echo "   To update: cd .playbook && git pull"
echo "   To update global rules: bash setup.sh --global"
echo ""
