import type { Db } from '../db/index.js';
import { COUNTRIES } from './reference.js';
import { generateEmployees } from './generate.js';

/** Replaces all data with `count` deterministic employees in a single transaction. */
export function seedDatabase(db: Db, count = 10_000, seed = 42): void {
  const employees = generateEmployees(count, seed);
  const now = new Date().toISOString();

  const insertEmployee = db.prepare(
    `INSERT INTO employees (first_name, last_name, email, job_title, department, country, currency, salary_minor, hire_date, status)
     VALUES (@firstName, @lastName, @email, @jobTitle, @department, @country, @currency, @salaryMinor, @hireDate, @status)`,
  );
  const insertHistory = db.prepare(
    `INSERT INTO salary_history (employee_id, old_salary_minor, new_salary_minor, changed_at, reason)
     VALUES (?, NULL, ?, ?, 'Initial salary')`,
  );
  const insertRate = db.prepare('INSERT OR REPLACE INTO fx_rates (currency, usd_per_unit) VALUES (?, ?)');

  db.transaction(() => {
    db.exec('DELETE FROM salary_history; DELETE FROM employees; DELETE FROM fx_rates;');
    for (const c of COUNTRIES) insertRate.run(c.currency, 1 / c.localPerUsd);
    for (const e of employees) {
      const { lastInsertRowid } = insertEmployee.run(e);
      insertHistory.run(lastInsertRowid, e.salaryMinor, now);
    }
  })();
}
