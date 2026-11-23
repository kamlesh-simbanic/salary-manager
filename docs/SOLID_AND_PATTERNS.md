# SOLID principles and design patterns

How the server code applies SOLID and which patterns it uses, with where to find each in the code.
Guiding rule: use a pattern only where it removes a real coupling or makes testing easier. No pattern for its own sake.

## Layering

```
HTTP route  ->  Service (use case)  ->  Repository interface  <-  SQLite repository
 (adapter)      (business rules)         (abstraction)             (implementation)
```

Dependencies point **inwards, towards abstractions**. Only `app.ts` knows the concrete classes.

## SOLID

| Principle | Where it is applied |
|---|---|
| **S**ingle Responsibility | Each file has one reason to change. `employee.schema.ts` = input validation. `employee-filters.ts` = turning a query into SQL `WHERE`. `sqlite-employee.repository.ts` = SQL only. `employee.service.ts` = business rules (unique email, history on salary change). `employee.routes.ts` = HTTP mapping only. |
| **O**pen/Closed | List filters are an array of small `FilterClause` functions in `employee-filters.ts`. A new filter (e.g. hire-date range) is one new function appended to the array; no existing filter or the repository changes. Sorting uses a `SORT_COLUMNS` map, so a new sort key is one line. |
| **L**iskov Substitution | Any `EmployeeReader`/`EmployeeWriter`/`SalaryHistoryRepository`/`TransactionRunner` implementation can replace the SQLite one (e.g. an in-memory fake, or a Postgres repository) and `EmployeeService` behaves identically. Contracts are expressed in the interfaces (`findById` returns `undefined`, never throws). |
| **I**nterface Segregation | `EmployeeRepository = EmployeeReader & EmployeeWriter`. Read-only consumers (list, and later insights and CSV export) depend on `EmployeeReader` only and cannot mutate data. |
| **D**ependency Inversion | `EmployeeService` depends on interfaces plus an injected clock (`now: () => Date`), never on `better-sqlite3`. Concrete classes are wired once in `buildApp()` (composition root). |

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| **Repository** | `employee.repository.ts` (interface) + `sqlite-employee.repository.ts` | Hides SQL behind a domain-oriented API; storage can change without touching business rules. |
| **Unit of Work** | `shared/transaction.ts` (`TransactionRunner`) | Lets the service make "update employee + write salary history" atomic without knowing about SQLite transactions. Tested: a failed update leaves data untouched. |
| **Dependency Injection** (constructor) | `EmployeeService`, `Sqlite*Repository` | Explicit dependencies; trivial to substitute in tests. |
| **Composition Root / Factory** | `buildApp(db)` in `app.ts`, `createDb()` in `db/index.ts` | One place builds the object graph; tests call `buildApp(createDb(':memory:'))`. |
| **Specification-style filter chain** | `employee-filters.ts` | Each filter is an independent, composable predicate producing a SQL fragment + params. |
| **Adapter** | `employee.routes.ts` | Translates HTTP <-> use cases; contains no business rules. |
| **Data Transfer / Validation at the boundary** | `employee.schema.ts` (Zod) | Input is parsed once at the edge; the inside of the system only sees typed, valid data. |
| **Error hierarchy + central handler** | `shared/errors.ts`, `setErrorHandler` in `app.ts` | Domain code throws `NotFoundError`/`ConflictError`/`ValidationError`; one place maps them to HTTP status codes. |

## Other deliberate decisions

- **Money as integer minor units** (`salaryMinor`): no float rounding errors.
- **Whitelisted sort columns + named SQL parameters**: user input never reaches SQL text, which prevents SQL injection. A test asserts a malicious `sortBy` is rejected.
- **Stable pagination**: `ORDER BY <col>, id` so duplicate sort values never skip or repeat rows between pages.
- **LIKE wildcard escaping** in search so `%` and `_` are matched literally.
- **Injected clock** so history timestamps are deterministic in tests.

## Bug the tests caught (worth mentioning in the interview)

Zod 4's `.partial()` kept the `status` default, so `PATCH {salaryMinor}` would have reset an inactive employee to *active*. Fixed by building the PATCH schema from a shape without defaults (see comment in `employee.schema.ts`), covered by `employee.schema.test.ts`.

## Trade-offs

- `EmployeeService` has more constructor parameters than a simpler design; the payoff is that it is fully testable and swappable. If it grows further it should be split by use case (query vs. command), which the Reader/Writer split already prepares.
- Search uses `LIKE '%term%'`, which cannot use an index. At 10k rows it measures under 10 ms. At millions of rows I would move to SQLite FTS5 or Postgres trigram indexes.
- Offset pagination is simple and fine here; keyset pagination is the upgrade for very deep pages.
