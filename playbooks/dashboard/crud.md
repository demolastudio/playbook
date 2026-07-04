## CRUD Pages

> Admin create/edit/delete flows. Every mutation follows the server-action
> pipeline (auth → validate → SSOT function → audit → typed result) — this
> chapter is what's specific to admin CRUD on top of it.

### The Page Set per Entity

| Page | Pattern |
| ---- | ------- |
| List | Server-side table (`data-tables.md`) with primary action ("New client") |
| Detail | Own fetch, full record + related activity (audit trail feed) |
| Create/Edit | One form component serving both — mode decided by presence of the record |
| Delete | Soft delete for business entities (`core/database.md`), always confirmed, never on the list row directly |

### Forms

- One schema drives client validation, server validation, and types (`z.infer`) — never two definitions of the same form
- Edit forms submit the **changed fields**, and the action validates against the current record version — blind full-object overwrites resurrect stale data from an old tab
- **Stale-edit guard:** carry `updatedAt` in the form; the action rejects if the record changed since load ("This client was updated by someone else — review and retry"). Optimistic locking, admin edition (`booking/concurrency.md`)
- Long forms save as drafts or sections — a 40-field form that loses everything on one validation error is a support ticket generator

### Optimistic UI — Earned, Not Default

| Mutation | UI |
| -------- | -- |
| Toggle, rename, note — cheap and reversible | Optimistic update, rollback + toast on failure |
| Anything touching money, slots, or notifications | Pending state → server confirms → UI updates. Never optimistic |

### Destructive Actions

- Confirmation names the consequence: "Cancel this plan — 6 upcoming visits will be released", not "Are you sure?"
- Irreversible + high-value (delete client with history): type-to-confirm the entity name
- Every destructive action audit-logs actor + reason (`core/audit-trails.md`); admin override flows require the reason field

### Rules

- **One form, both modes; one schema, all layers.**
- **Reject stale edits** — concurrent admins are normal, silent last-write-wins is not.
- **Optimistic only when reversible.**
- **Confirmations state consequences.**
