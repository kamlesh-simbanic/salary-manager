import type { EmployeeListQuery, SortKey } from './employee.types.js';

interface Fragment {
  sql: string;
  params: Record<string, string>;
}

/** One filter = one small function. Adding a filter never touches existing ones (Open/Closed). */
type FilterClause = (query: EmployeeListQuery) => Fragment | null;

const equals =
  (field: 'country' | 'department' | 'jobTitle' | 'status', column: string): FilterClause =>
  (query) => {
    const value = query[field];
    return value ? { sql: `${column} = @${field}`, params: { [field]: value } } : null;
  };

const escapeLike = (term: string) => term.replace(/[\\%_]/g, (c) => `\\${c}`);

const search: FilterClause = ({ search: term }) =>
  term
    ? {
        sql: `(first_name LIKE @search ESCAPE '\\' OR last_name LIKE @search ESCAPE '\\' OR email LIKE @search ESCAPE '\\')`,
        params: { search: `%${escapeLike(term)}%` },
      }
    : null;

const FILTERS: FilterClause[] = [
  search,
  equals('country', 'country'),
  equals('department', 'department'),
  equals('jobTitle', 'job_title'),
  equals('status', 'status'),
];

export function buildWhere(query: EmployeeListQuery): { where: string; params: Record<string, string> } {
  const fragments = FILTERS.map((f) => f(query)).filter((f): f is Fragment => f !== null);
  return {
    where: fragments.length ? `WHERE ${fragments.map((f) => f.sql).join(' AND ')}` : '',
    params: Object.assign({}, ...fragments.map((f) => f.params)),
  };
}

/** Whitelist: user input never reaches ORDER BY directly (prevents SQL injection). */
export const SORT_COLUMNS: Record<SortKey, string> = {
  lastName: 'last_name',
  salary: 'salary_minor',
  hireDate: 'hire_date',
  country: 'country',
  jobTitle: 'job_title',
};
