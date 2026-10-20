#!/usr/bin/env node
// Claude Code PreToolUse hook (Bash): blocks git commands that destroy
// uncommitted work or branches. Exit 2 blocks the call and shows stderr to Claude.
import { readFileSync } from "node:fs";

const command = (JSON.parse(readFileSync(0, "utf8")).tool_input?.command ?? "").replace(/'[^']*'|"[^"]*"/g, "''");
const destructive = [
  [/\bgit\b[^;&|\n]*\breset\s+(?:\S+\s+)*--hard\b/, "git reset --hard"],
  [/\bgit\b[^;&|\n]*\bclean\s+(?:\S+\s+)*-[a-zA-Z]*f/, "git clean -f"],
  [/\bgit\b[^;&|\n]*\bbranch\s+(?:\S+\s+)*-[a-zA-Z]*D\b/, "git branch -D"],
  [/\bgit\b[^;&|\n]*\bcheckout\s+(?:--\s+)?\.(?:\s|$)/, "git checkout ."],
  [/\bgit\b[^;&|\n]*\brestore\s+(?:--worktree\s+)?\.(?:\s|$)/, "git restore ."],
];
const hit = destructive.find(([pattern]) => pattern.test(command));
if (hit) {
  process.stderr.write(`Blocked by the playbook git guard: ${hit[1]} destroys work that may not be saved anywhere. Ask the user to run it themselves if it is really needed.\n`);
  process.exit(2);
}
