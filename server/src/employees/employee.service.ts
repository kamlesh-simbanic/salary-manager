import { ConflictError, NotFoundError, ValidationError } from '../shared/errors.js';
import type { TransactionRunner } from '../shared/transaction.js';
import type { SalaryHistoryEntry, SalaryHistoryRepository } from '../history/salary-history.repository.js';
import type { EmployeeReader, EmployeeWriter } from './employee.repository.js';
import type { Employee, EmployeeChanges, EmployeeListQuery, NewEmployee, Page } from './employee.types.js';

/**
 * Application use cases for employees. Depends only on abstractions
 * (repositories, transaction runner, clock), so it is testable without a database.
 */
export class EmployeeService {
  constructor(
    private readonly reader: EmployeeReader,
    private readonly writer: EmployeeWriter,
    private readonly history: SalaryHistoryRepository,
    private readonly transactions: TransactionRunner,
    private readonly now: () => Date = () => new Date(),
  ) {}

  list(query: EmployeeListQuery): Page<Employee> {
    return this.reader.list(query);
  }

  get(id: number): Employee {
    const employee = this.reader.findById(id);
    if (!employee) throw new NotFoundError('Employee', id);
    return employee;
  }

  create(input: NewEmployee): Employee {
    return this.transactions.run(() => {
      this.assertEmailFree(input.email);
      const employee = this.writer.insert(input);
      this.recordSalary(employee.id, null, employee.salaryMinor, 'Initial salary');
      return employee;
    });
  }

  update(id: number, changes: EmployeeChanges, reason?: string): Employee {
    if (Object.values(changes).every((v) => v === undefined)) {
      throw new ValidationError('At least one field must be provided');
    }
    return this.transactions.run(() => {
      const existing = this.get(id);
      if (changes.email && changes.email !== existing.email) this.assertEmailFree(changes.email);
      const updated = this.writer.update(id, changes)!;
      if (updated.salaryMinor !== existing.salaryMinor) {
        this.recordSalary(id, existing.salaryMinor, updated.salaryMinor, reason ?? null);
      }
      return updated;
    });
  }

  remove(id: number): void {
    if (!this.writer.delete(id)) throw new NotFoundError('Employee', id);
  }

  salaryHistory(id: number): SalaryHistoryEntry[] {
    this.get(id);
    return this.history.listFor(id);
  }

  private assertEmailFree(email: string): void {
    if (this.reader.findByEmail(email)) throw new ConflictError(`Email ${email} is already in use`);
  }

  private recordSalary(employeeId: number, oldMinor: number | null, newMinor: number, reason: string | null): void {
    this.history.record({
      employeeId,
      oldSalaryMinor: oldMinor,
      newSalaryMinor: newMinor,
      changedAt: this.now().toISOString(),
      reason,
    });
  }
}
