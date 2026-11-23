import { beforeEach, describe, expect, it } from 'vitest';
import { createDb } from '../db/index.js';
import { SqliteSalaryHistoryRepository } from '../history/sqlite-salary-history.repository.js';
import { ConflictError, NotFoundError, ValidationError } from '../shared/errors.js';
import { SqliteTransactionRunner } from '../shared/transaction.js';
import { sampleEmployee } from '../test/helpers.js';
import { EmployeeService } from './employee.service.js';
import { SqliteEmployeeRepository } from './sqlite-employee.repository.js';

const FIXED_NOW = new Date('2025-01-15T10:00:00.000Z');

function buildService() {
  const db = createDb(':memory:');
  const employees = new SqliteEmployeeRepository(db);
  return new EmployeeService(
    employees,
    employees,
    new SqliteSalaryHistoryRepository(db),
    new SqliteTransactionRunner(db),
    () => FIXED_NOW, // injected clock keeps timestamps deterministic
  );
}

describe('EmployeeService', () => {
  let service: EmployeeService;
  beforeEach(() => {
    service = buildService();
  });

  it('creates an employee and records the initial salary', () => {
    const created = service.create(sampleEmployee({ salaryMinor: 500 }));
    expect(service.salaryHistory(created.id)).toEqual([
      expect.objectContaining({
        oldSalaryMinor: null,
        newSalaryMinor: 500,
        reason: 'Initial salary',
        changedAt: FIXED_NOW.toISOString(),
      }),
    ]);
  });

  it('rejects a duplicate email', () => {
    service.create(sampleEmployee({ email: 'dup@x.example' }));
    expect(() => service.create(sampleEmployee({ email: 'dup@x.example' }))).toThrow(ConflictError);
  });

  it('throws NotFoundError for unknown ids', () => {
    expect(() => service.get(1)).toThrow(NotFoundError);
    expect(() => service.remove(1)).toThrow(NotFoundError);
    expect(() => service.update(1, { country: 'India' })).toThrow(NotFoundError);
  });

  it('records history only when the salary actually changes', () => {
    const { id } = service.create(sampleEmployee({ salaryMinor: 100 }));
    service.update(id, { jobTitle: 'Staff Engineer' });
    service.update(id, { salaryMinor: 100 });
    expect(service.salaryHistory(id)).toHaveLength(1);

    service.update(id, { salaryMinor: 150 }, 'Promotion');
    const [latest] = service.salaryHistory(id);
    expect(latest).toMatchObject({ oldSalaryMinor: 100, newSalaryMinor: 150, reason: 'Promotion' });
  });

  it('rejects an update that steals another employee email, and leaves data untouched', () => {
    service.create(sampleEmployee({ email: 'taken@x.example' }));
    const { id } = service.create(sampleEmployee({ salaryMinor: 100 }));
    expect(() => service.update(id, { email: 'taken@x.example', salaryMinor: 999 })).toThrow(ConflictError);
    expect(service.get(id).salaryMinor).toBe(100);
  });

  it('rejects an empty update', () => {
    const { id } = service.create(sampleEmployee());
    expect(() => service.update(id, {})).toThrow(ValidationError);
  });

  it('removes an employee together with their history', () => {
    const { id } = service.create(sampleEmployee());
    service.remove(id);
    expect(() => service.get(id)).toThrow(NotFoundError);
  });
});
