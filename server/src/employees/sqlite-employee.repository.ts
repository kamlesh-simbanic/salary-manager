import type { Db } from '../db/index.js';
import { buildWhere, SORT_COLUMNS } from './employee-filters.js';
import type { EmployeeRepository } from './employee.repository.js';
import type { Employee, EmployeeChanges, EmployeeListQuery, NewEmployee, Page } from './employee.types.js';

/** Column aliases map snake_case rows straight to the camelCase Employee shape. */
const SELECT = `SELECT id, first_name AS firstName, last_name AS lastName, email, job_title AS jobTitle,
  department, country, currency, salary_minor AS salaryMinor, hire_date AS hireDate, status FROM employees`;

const UPDATABLE_COLUMNS: Record<keyof NewEmployee, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  jobTitle: 'job_title',
  department: 'department',
  country: 'country',
  currency: 'currency',
  salaryMinor: 'salary_minor',
  hireDate: 'hire_date',
  status: 'status',
};

export class SqliteEmployeeRepository implements EmployeeRepository {
  constructor(private readonly db: Db) {}

  findById(id: number): Employee | undefined {
    return this.db.prepare(`${SELECT} WHERE id = ?`).get(id) as Employee | undefined;
  }

  findByEmail(email: string): Employee | undefined {
    return this.db.prepare(`${SELECT} WHERE email = ?`).get(email) as Employee | undefined;
  }

  list(query: EmployeeListQuery): Page<Employee> {
    const { where, params } = buildWhere(query);
    const { total } = this.db.prepare(`SELECT COUNT(*) AS total FROM employees ${where}`).get(params) as {
      total: number;
    };
    // id is a tiebreaker so pagination is stable when the sort column has duplicates.
    const items = this.db
      .prepare(
        `${SELECT} ${where} ORDER BY ${SORT_COLUMNS[query.sortBy]} ${query.sortDir === 'desc' ? 'DESC' : 'ASC'}, id ASC
         LIMIT @limit OFFSET @offset`,
      )
      .all({ ...params, limit: query.pageSize, offset: (query.page - 1) * query.pageSize }) as Employee[];
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  insert(employee: NewEmployee): Employee {
    const { lastInsertRowid } = this.db
      .prepare(
        `INSERT INTO employees (first_name, last_name, email, job_title, department, country, currency, salary_minor, hire_date, status)
         VALUES (@firstName, @lastName, @email, @jobTitle, @department, @country, @currency, @salaryMinor, @hireDate, @status)`,
      )
      .run(employee);
    return this.findById(Number(lastInsertRowid))!;
  }

  update(id: number, changes: EmployeeChanges): Employee | undefined {
    const entries = Object.entries(changes).filter(([key, value]) => key in UPDATABLE_COLUMNS && value !== undefined);
    if (entries.length > 0) {
      const set = entries.map(([key]) => `${UPDATABLE_COLUMNS[key as keyof NewEmployee]} = @${key}`).join(', ');
      this.db.prepare(`UPDATE employees SET ${set} WHERE id = @id`).run({ ...Object.fromEntries(entries), id });
    }
    return this.findById(id);
  }

  delete(id: number): boolean {
    return this.db.prepare('DELETE FROM employees WHERE id = ?').run(id).changes > 0;
  }
}
