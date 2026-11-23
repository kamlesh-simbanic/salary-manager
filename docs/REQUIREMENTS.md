# Requirements: Salary Manager

## Goal
Replace the HR team's Excel sheets with a web app so the HR Manager can **manage** salary data for ~10,000 employees across countries and **answer questions about how the org pays people**.

## Persona
HR Manager (single trusted user).

## In scope
1. **Employee management**: create, view, edit, delete employees (name, email, job title, department, country, currency, salary, hire date, status).
2. **Browse 10k records quickly**: server-side search, filters (country, department, job title), sort, pagination.
3. **Salary history**: every salary change is recorded (old, new, when, optional reason) so changes are auditable.
4. **Pay insights**: min / median / average / max salary and headcount by country, department and job title; salary distribution; top and bottom earners.
5. **Multi-currency**: salary stored in local currency; a normalised USD view (static rates table) enables cross-country comparison.
6. **CSV import / export**: eases the move away from Excel.
7. **Seed script**: deterministic 10,000 realistic employees.

## Deliberately out of scope (and why)
| Left out | Reason |
|---|---|
| Authentication / roles | Single persona; adds time without showing salary-domain judgment. Documented as the first follow-up. |
| Payroll, tax, bonus, equity | Different problem; salary base pay only. |
| Approval workflows | Premature for a single user. |
| Live FX rates | Static rates keep insights deterministic and testable. |
| Multi-tenancy | One org. |

## Non-functional targets
- Employee list responds < 300 ms and insights < 500 ms at 10k rows (measured in docs/PERFORMANCE.md).
- Money stored as integer minor units, never floats.
- Fast, deterministic unit tests (in-memory SQLite).

## Assumptions
- No existing Excel layout was provided, so the schema is designed from scratch.
- Cross-country comparison uses a normalised USD view.
