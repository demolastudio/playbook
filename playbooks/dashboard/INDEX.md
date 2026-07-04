# Dashboard Playbook — Index

> Admin panel *functionality* — data flow, permissions, exports. Dashboard
> *design* (layout anatomy, tables' visual rules, density, states) is
> `ui-ux/dashboards.md`; read both when building admin UIs.
> For general patterns (database, auth, security), see `core/INDEX.md`.
>
> **For AI agents:** Read this INDEX, then ONLY the routed chapter for your task.

## Routing Table

| File | Covers | Read when you are... |
| ---- | ------ | -------------------- |
| [data-tables.md](./data-tables.md) | Server-side pagination/sort/filter, URL state, search | Building any admin list view |
| [crud.md](./crud.md) | Forms, stale-edit guards, optimistic UI, destructive actions | Building create/edit/delete flows |
| [rbac.md](./rbac.md) | Owner/Manager/Staff roles, DAL enforcement, row scoping | Adding roles or permission checks |
| [exports.md](./exports.md) | CSV pipeline, formula-injection safety, reports | Building exports or reports |

## Planned Chapters

- [ ] **charts.md** — Chart data endpoints, aggregation queries, real-time updates
- [ ] **notifications.md** — Toast system, in-app notification feed
- [ ] **anti-patterns.md** — Dashboard mistakes (client-side filtering, over-fetching)
