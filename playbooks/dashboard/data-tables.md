## Data Tables (Server-Side)

> The engineering behind every admin list view. Visual rules (alignment,
> density, states) live in `ui-ux/dashboards.md` — this chapter is the data flow.

### Server-Side Everything

Past ~100 rows, the server owns pagination, sorting, filtering, and search. Client-side table state is a demo pattern — it over-fetches, breaks shareable URLs, and dies on real datasets (see `core/anti-patterns.md` #6).

```
searchParams (URL)  →  parse + validate (schema)  →  DAL query  →  page of rows + total
```

- **URL is the single source of table state** — page, sort, filters, search all live in searchParams; the table renders what the server returned, nothing more
- Validate searchParams with a schema like any other untrusted input: whitelist sortable columns, clamp page size (max 100), reject unknown filters
- **Sorting by unindexed columns is a denial-of-service on your own DB** — the sortable-column whitelist and the index list are the same list (`core/database-indexing.md`)

### Pagination

| Context | Pattern |
| ------- | ------- |
| Admin tables (jump to page, show totals) | OFFSET is acceptable up to ~10K rows — admins need page numbers |
| Feeds and exports | Cursor/keyset — constant-time at any depth (`core/database-indexing.md`) |
| Counts | `count()` on the filtered query, cached briefly — exact totals on every keystroke are wasted queries |

### Search

- Debounced input (~300ms) updating the URL, server-side `ILIKE` on a small whitelist of columns (name, email, phone)
- Normalize the needle (trim, lowercase, strip phone formatting) before querying — clients search "0801 234" for `+2348012345678`
- Full-text/trigram indexes only when `ILIKE` measurably hurts — not by default

### Row Data Discipline

- The list query `select`s exactly the columns the table shows — the detail view does its own fetch
- Ownership scoping applies to admin queries too: a staff-level user's table query filters by their permitted scope in the DAL, not in the UI (`core/security.md` BOLA)
- Bulk actions post the selected IDs to one action that re-verifies each ID's scope server-side — never trust a checkbox list

### Rules

- **URL = table state.** A filtered view must be shareable and refresh-safe.
- **Whitelist sort columns; clamp page size.** searchParams are user input.
- **Select what the table shows** — the 50-column row belongs to the detail page.
- **Totals are cacheable; rows are not.**
