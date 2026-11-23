import type { Employee, EmployeeChanges, EmployeeListQuery, NewEmployee, Page } from './employee.types.js';

/** Read side: what list/detail/insights/export consumers need. */
export interface EmployeeReader {
  findById(id: number): Employee | undefined;
  findByEmail(email: string): Employee | undefined;
  list(query: EmployeeListQuery): Page<Employee>;
}

/** Write side: what only the mutation use cases need. */
export interface EmployeeWriter {
  insert(employee: NewEmployee): Employee;
  update(id: number, changes: EmployeeChanges): Employee | undefined;
  delete(id: number): boolean;
}

export type EmployeeRepository = EmployeeReader & EmployeeWriter;
