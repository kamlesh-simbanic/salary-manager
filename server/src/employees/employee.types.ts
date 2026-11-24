export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  /** ISO 4217 code of the salary currency, e.g. "INR". */
  currency: string;
  /** Annual salary in integer minor units (e.g. paise/cents). */
  salaryMinor: number;
  /** ISO date, YYYY-MM-DD. */
  hireDate: string;
  status: EmployeeStatus;
}

export type NewEmployee = Omit<Employee, 'id'>;
export type EmployeeChanges = Partial<NewEmployee>;

export const SORT_KEYS = ['lastName', 'salary', 'hireDate', 'country', 'jobTitle'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

/** Row filters shared by the employee list and the insights queries. */
export interface EmployeeFilter {
  search?: string;
  country?: string;
  department?: string;
  jobTitle?: string;
  status?: EmployeeStatus;
}

export interface EmployeeListQuery extends EmployeeFilter {
  sortBy: SortKey;
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
