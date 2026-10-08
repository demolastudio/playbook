# Global Rules — Applied to EVERY project

Priority order: correctness and safety first (rules 1–4), then conventions (rules 5–11).

1. ALWAYS read `.playbook/rules/` before writing any code. If a `.playbook/stacks/` profile matches the project, read its STACK.md too. If `.playbook/` does not exist, read the master playbook at `~/Documents/personal/demolastudio-oss/playbook/rules/` and suggest running its `setup.sh` on this project.
2. PLAN FIRST for new features and architectural changes: present a plan and wait for approval. Bug fixes, small changes, and work under an already-approved plan proceed directly.
3. A task is complete ONLY when `.playbook/rules/definition-of-done.md` passes. Run the checks — never assume.
4. NEVER guess or assume. Research the official docs for the installed version when stuck. Prefer current-version documentation — check the current date and never apply legacy patterns to a modern stack.
5. NEVER add comments to code. Names and structure must carry the meaning.
6. ALWAYS use kebab-case for file and folder names.
7. ALWAYS group code by feature (`features/<name>/`: schema, actions, queries, one file per use case); shared infrastructure goes in `lib/`. Imports flow one way: app → features → lib, components, db.
8. NEVER make up preferences the user did not state. Ask if unclear.
9. In TypeScript/JavaScript, ALWAYS use arrow functions (`const fn = async () => {}`) — never `function` declarations.
10. Write explanations and reports to the user in ASD-STE100 Simplified Technical English: short sentences, active voice, one instruction per sentence, one meaning per word. Technical names stay exact. For a complex topic, use a diagram or a page instead of long text.
11. Start with the simplest version that works. Add structure (layers, options, abstractions) only when a second real case needs it, and name the trade-off when you do.
