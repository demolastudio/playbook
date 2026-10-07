## Database Design & Performance

### Primary Key Strategy

The choice of ID type affects indexing, write performance, and debugging:

| Type | Sortable? | Storage | B-Tree Impact | Best For |
| ---- | --------- | ------- | ------------- | -------- |
| **Auto-increment INT** | Yes | 4–8 bytes | Optimal (sequential) | Simple apps, never exposed in URLs |
| **UUID v4** | No | 16 bytes (native) | **High fragmentation** (random inserts scatter across B-tree pages) | Low-write systems, legacy compatibility |
| **UUID v7** | Yes (time) | 16 bytes (native) | Minimal (time-ordered, appends to right side of tree) | High-performance, modern standard |
| **CUID2** | No | 24+ chars (text) | Moderate (random-ish) | URL-friendly, distributed generation |
| **ULID** | Yes (time) | 26 chars (text) | Minimal (time-ordered) | Distributed, human-readable |

#### Why B-Tree Order Matters

B-tree indexes are optimized for sequential inserts. Random IDs (UUID v4, CUID2) cause **page splits** — the database frequently reorganizes index pages, leading to:
- Index bloat (partially-full pages)
- I/O thrashing (hot data spread across many pages)
- Write amplification (more work per insert)

#### Recommendation

- **For new projects:** UUID v7 — time-sortable, native PostgreSQL type, 16-byte storage. Postgres 18+ generates it natively: make `uuidv7()` the column default (check `select version()`; older versions generate in the app)
- **If already using CUID2:** Fine for most booking systems at small-to-medium scale. The B-tree impact is real but manageable. Migrate to UUID v7 only if write throughput becomes a bottleneck.
- **Never use auto-increment IDs in URLs** — they leak information (total count, creation order, enumeration attacks)

---

### Transaction Patterns

#### Keep Transactions Short

```
✅  BEGIN → read → validate → write → COMMIT (milliseconds)
❌  BEGIN → read → call Stripe API → wait 2 seconds → write → COMMIT (holds locks)
```

**Never hold a database transaction open while calling an external service.** The lock blocks all other transactions on the affected rows.

#### Isolation Levels

| Level | Prevents | Cost | Use When |
| ----- | -------- | ---- | -------- |
| **Read Committed** (default) | Dirty reads | Low | Most queries |
| **Repeatable Read** | Non-repeatable reads | Medium | Financial calculations |
| **Serializable** | All anomalies | High (retries needed) | Critical booking mutations |

For most booking operations, Read Committed + targeted `SELECT FOR UPDATE` with a targeted `FOR UPDATE` lock is better than global Serializable — lock only what you need.

#### Advisory Locks

Application-defined locks that don't lock table rows:

```
Lock: advisory_lock(hash('booking:resource:123'))
Do work
Unlock
```

Useful for coordinating across distributed workers (e.g., "only one process should generate slots for resource 123 at a time") without table-level contention.

**Unavailable behind transaction-mode poolers.** Cloudflare Hyperdrive doesn't support them, and a session lock under PgBouncer transaction mode outlives the borrowed connection. There, serialize with `SELECT … FOR UPDATE` in a short transaction, a conditional `UPDATE … WHERE status = 'PENDING'` (check the affected-row count), or a unique constraint.

---

### Connection Management

| Strategy | When | Why |
| -------- | ---- | --- |
| **Connection pooler** (PgBouncer, built-in ORM pool) | Always in production | Reuse connections, prevent exhaustion |
| **Pooled connection string** | Application queries | Routes through the pooler |
| **Direct connection string** | Schema migrations only | Migrations need direct access, not pooled |
| **Read replicas** | High read volume | Offload dashboard/reporting queries from the primary writer |

**Pool sizing rule of thumb:** 2–4× the number of CPU cores. Too many connections cause context switching; too few cause request queuing.

**One pooler, not two.** An edge pooler (Hyperdrive) connects to the database's direct endpoint — on Neon, the host without `-pooler` — because two poolers in series fight over the same connections.

### Roles & Least Privilege

The app connects with a role holding only the grants it uses — e.g. `INSERT, SELECT` on the audit log and no `UPDATE`/`DELETE`, so append-only is enforced by the database. Migrations run as a separate owner role. On Neon, roles created in the console join `neon_superuser` and inherit broad access: create least-privilege roles in SQL with explicit grants.

---

### Soft Delete

Use `deleted_at` (timestamp) instead of `is_deleted` (boolean):

| Approach | Pros | Cons |
| -------- | ---- | ---- |
| **Soft delete** (`deleted_at` timestamp) | Recovery possible, audit trail preserved, foreign keys intact | Queries must filter `WHERE deleted_at IS NULL`, table grows |
| **Hard delete** | Reclaims space, simpler queries | Data lost forever, breaks referential integrity |

- **Use soft delete for business entities** (bookings, clients, plans) — you need the history
- **Use hard delete for ephemeral data** (session tokens, temporary locks) — no value in keeping them
- **Auto-purge soft-deleted records** after a retention period (e.g., 90 days) to prevent table bloat

---

### Schema Evolution

- **Treat schema as code.** Every change is a versioned migration file, never a manual `ALTER TABLE` in production.
- **Small, backward-compatible changes.** Add a column → deploy code that uses it → remove the old column. Never drop a column before the code stops reading it.
- **Test migrations against production-sized data.** A migration that takes 1 second on 1,000 rows can lock the table for 10 minutes on 1 million rows.
- **Use `CREATE INDEX CONCURRENTLY`** to avoid locking the table during index creation.

---

### Data Archiving

As tables grow past millions of rows, performance degrades:

| Strategy | How It Works | When |
| -------- | ------------ | ---- |
| **Time-based partitioning** | Partition bookings by month/year, detach old partitions | Tables > 1M rows with date-based queries |
| **Cold storage migration** | Move completed/cancelled bookings older than N months to an archive table or object storage | Reducing active table size |
| **Auto-vacuum tuning** | Ensure your database runs vacuum frequently enough on high-churn tables | Always — prevents bloat |

---

### Rules

- **Timestamps are `timestamp with time zone`.** A plain `timestamp` stores the client's local wall time — local time from a laptop, UTC from a server.
- **Verify the server certificate:** `sslmode=verify-full` in every connection string.
- **Use the smallest data type that fits.** `INT` vs `BIGINT`, specific `DATE` vs `TIMESTAMP` — smaller types improve cache efficiency.
- **`EXPLAIN ANALYZE` before optimizing.** Never guess — indexing and query patterns live in `database-indexing.md`.
- **Keep transactions under 100ms.** If a transaction takes longer, you're probably holding a lock during an external call.
- **Separate migration and application connection strings.** Migrations need direct access; app queries go through the pooler.
