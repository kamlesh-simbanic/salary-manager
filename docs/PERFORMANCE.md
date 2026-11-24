# Performance notes

Measured locally (Node 20, SQLite file DB, single request each, 10,000 seeded employees).
Target from the requirements: list < 300 ms, insights < 500 ms.

| Operation | Time |
|---|---|
| Seed 10,000 employees (one transaction + prepared statements) | ~240 ms |
| `GET /api/employees` (page of 25, sorted) | ~9 ms |
| `GET /api/employees` with country + department filters, sort by salary | ~5 ms |
| `GET /api/employees?search=...` | ~8 ms |
| `GET /api/insights/summary` | ~31 ms |
| `GET /api/insights/by/country` (and department, jobTitle) | ~24 ms |
| `GET /api/insights/distribution` | ~7 ms |
| `GET /api/insights/earners` | ~5 ms |

## What makes it fast
- **Server-side pagination** with a max page size of 100: the browser never receives 10k rows.
- **Aggregation in SQL**: count/min/max/mean/total with `GROUP BY`; median via window functions (`ROW_NUMBER`, `COUNT OVER`). Nothing is loaded into Node memory.
- **Indexes** on country, department, job_title, last_name, and the salary_history employee id.
- **Batch seeding**: one transaction, prepared statements.
- **WAL mode** for the SQLite file.

## Known limits and what I would do next
- `LIKE '%term%'` search cannot use an index. Fine at 10k rows (~8 ms). At millions of rows: SQLite FTS5 or Postgres trigram.
- Insights recompute on every request. If data grew or traffic increased, cache them or keep materialised aggregates invalidated on write.
- Offset pagination degrades on very deep pages; keyset pagination is the upgrade.
- Median via window functions sorts each group: O(n log n), fine for this scale.
