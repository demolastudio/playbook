# Cursor Global Rules

> Cursor has no file-based global config. Paste the **numbered list from
> [global-rules.md](./global-rules.md)** into:
> **Cursor Settings → General → Rules for AI**
>
> That file is the single source of truth — this one is only the pointer.
> Whenever `global-rules.md` changes, re-paste it into Cursor.

For project-level rules, `setup.sh` already installs the playbook workflows as
slash commands in `.cursor/commands/` plus an always-apply rule, and Cursor
reads the generated `AGENTS.md` natively.
