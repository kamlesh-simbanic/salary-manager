import type { Db } from '../db/index.js';
import type {
  NewSalaryHistoryEntry,
  SalaryHistoryEntry,
  SalaryHistoryRepository,
} from './salary-history.repository.js';

export class SqliteSalaryHistoryRepository implements SalaryHistoryRepository {
  constructor(private readonly db: Db) {}

  record(entry: NewSalaryHistoryEntry): void {
    this.db
      .prepare(
        `INSERT INTO salary_history (employee_id, old_salary_minor, new_salary_minor, changed_at, reason)
         VALUES (@employeeId, @oldSalaryMinor, @newSalaryMinor, @changedAt, @reason)`,
      )
      .run(entry);
  }

  listFor(employeeId: number): SalaryHistoryEntry[] {
    return this.db
      .prepare(
        `SELECT id, employee_id AS employeeId, old_salary_minor AS oldSalaryMinor,
                new_salary_minor AS newSalaryMinor, changed_at AS changedAt, reason
         FROM salary_history WHERE employee_id = ? ORDER BY id DESC`,
      )
      .all(employeeId) as SalaryHistoryEntry[];
  }
}
