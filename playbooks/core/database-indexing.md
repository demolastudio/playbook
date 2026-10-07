## Indexing & Query Optimization

> Companion to `database.md`. Indexes speed reads and slow writes — every one is
> intentional, and every one is proven with `EXPLAIN ANALYZE` on realistic data.

### Indexing Strategy

#### Index Types for Booking Systems

| Index Type | When to Use | Example |
| ---------- | ----------- | ------- |
| **Single column** | Frequent filter on one field | `CREATE INDEX ON bookings(client_id)` |
| **Composite** | Filter on multiple fields together | `CREATE INDEX ON bookings(resource_id, status, start_time)` |
| **Partial** | Most queries only care about a subset | `CREATE INDEX ON bookings(start_time) WHERE status = 'CONFIRMED'` |
| **Covering (INCLUDE)** | Query can be satisfied entirely from the index | `CREATE INDEX ON bookings(client_id) INCLUDE (status, start_time)` |

#### Composite Index Column Order

**Equality columns first, range columns last:**

```
✅  (resource_id, status, start_time)  — equality, equality, range
❌  (start_time, resource_id, status)  — range first kills selectivity
```

#### Essential Indexes for Booking Systems

| Query Pattern | Recommended Index |
| ------------- | ----------------- |
| "What's available for this resource?" | `(resource_id, status, start_time)` |
| "All bookings for this client" | `(client_id, created_at DESC)` |
| "Upcoming confirmed bookings" | Partial: `(start_time) WHERE status = 'CONFIRMED'` |
| "Audit trail for this entity" | `(entity, entity_id, created_at)` |

#### Sort Direction Must Match NULLS Order

A descending index serves `ORDER BY … DESC` only if its NULLS order matches. Postgres sorts `DESC` as `NULLS FIRST` by default, so an index built `DESC NULLS LAST` (some query builders emit this for a bare `.desc()`) is ignored and the whole table gets sorted. Declare the index exactly as the query sorts, then confirm with `EXPLAIN` on a few thousand rows — tiny seed data hides the miss.

#### When NOT to Index

- Columns with very low cardinality (e.g., boolean `is_active` on a small table)
- Tables with < 1,000 rows — sequential scan is faster
- Columns only used in `SELECT`, not in `WHERE` / `JOIN` / `ORDER BY`

---

### Query Optimization

#### N+1 Prevention

The most common performance killer in ORM-based systems:

```
❌ N+1: 1 query for bookings + N queries for each booking's client
   SELECT * FROM bookings
   For each booking: SELECT * FROM clients WHERE id = booking.client_id

✅ Single query with join / eager loading:
   SELECT * FROM bookings JOIN clients ON bookings.client_id = clients.id
```

**Detection:** Monitor query counts per request. If a single page load triggers 50+ queries, you likely have an N+1. Use `pg_stat_statements` to find frequently-executed queries.

#### Select Only What You Need

```
❌  SELECT * FROM bookings  (fetches all 20+ columns)
✅  SELECT id, status, start_time, client_id FROM bookings  (fetches 4 columns)
```

Narrower selects reduce I/O, improve cache hit rates, and enable covering index scans.

#### Pagination

**Never use OFFSET for large datasets.** It gets slower as the offset grows because the database still scans all skipped rows.

```
❌  SELECT * FROM bookings ORDER BY created_at OFFSET 10000 LIMIT 20
✅  SELECT * FROM bookings
    WHERE (created_at, id) < (:lastCreatedAt, :lastId)
    ORDER BY created_at DESC, id DESC LIMIT 20
```

Cursor-based pagination (keyset) is constant-time regardless of page depth. The cursor includes a unique tiebreaker (`id`) — a timestamp alone skips rows that share it — and an index on `(created_at DESC, id DESC)` serves it.

---

### Rules

- **Index foreign keys.** They're not auto-indexed in PostgreSQL. Missing FK indexes cause slow joins.
- **Prove every index with `EXPLAIN ANALYZE`** on production-sized data — never guess.
- **Prefer keyset pagination** with a unique tiebreaker. OFFSET degrades linearly with depth.
- **Monitor `pg_stat_statements`.** It reveals your slowest and most-frequent queries — optimize those first.
