#!/usr/bin/env node
// Adds the git guard to a Claude Code settings file as a PreToolUse hook on
// Bash, once. Keeps every other setting; refuses to touch invalid JSON.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const [settingsPath, hookPath] = process.argv.slice(2);
const command = `node "${hookPath}"`;
const settings = existsSync(settingsPath) ? JSON.parse(readFileSync(settingsPath, "utf8")) : {};
settings.hooks ??= {};
settings.hooks.PreToolUse ??= [];
const registered = settings.hooks.PreToolUse.some((entry) => entry.hooks?.some((hook) => hook.command === command));
if (!registered) {
  settings.hooks.PreToolUse.push({ matcher: "Bash", hooks: [{ type: "command", command }] });
  writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}
