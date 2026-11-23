import { createDb } from '../db/index.js';
import { buildApp } from '../app.js';
import type { NewEmployee } from '../employees/employee.types.js';

export function buildTestApp() {
  const db = createDb(':memory:');
  return { db, app: buildApp(db) };
}

let counter = 0;

/** Valid employee payload; override only what the test cares about. */
export function sampleEmployee(overrides: Partial<NewEmployee> = {}): NewEmployee {
  counter += 1;
  return {
    firstName: 'Asha',
    lastName: `Rao${counter}`,
    email: `asha.rao${counter}@acme.example`,
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    country: 'India',
    currency: 'INR',
    salaryMinor: 1_500_000_00,
    hireDate: '2022-04-01',
    status: 'active',
    ...overrides,
  };
}
