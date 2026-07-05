# Global Rules — Applied to EVERY project

Priority order: correctness and safety first (rules 1–4), then conventions (rules 5–9).

1. ALWAYS read `.playbook/rules/` before writing any code. If a `.playbook/stacks/` profile matches the project, read its STACK.md too. If `.playbook/` does not exist, read the master playbook at `~/Documents/my-playbook/rules/` and suggest running its `setup.sh` on this project.
2. PLAN FIRST for new features and architectural changes: present a plan and wait for approval. Bug fixes, small changes, and work under an already-approved plan proceed directly.
3. A task is complete ONLY when `.playbook/rules/definition-of-done.md` passes. Run the checks — never assume.
4. NEVER guess or assume. Research the official docs for the installed version when stuck. Prefer current-version documentation — check the current date and never apply legacy patterns to a modern stack.
5. NEVER add comments to code. Names and structure must carry the meaning.
6. ALWAYS use kebab-case for file and folder names.
7. ALWAYS split code by concern: `types/`, `schemas/`, `actions/`, `hooks/` — or the stack's equivalent.
8. NEVER make up preferences the user did not state. Ask if unclear.
9. In TypeScript/JavaScript, ALWAYS use arrow functions (`const fn = async () => {}`) — never `function` declarations.
