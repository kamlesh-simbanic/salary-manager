import { faker } from '@faker-js/faker';
import { toMinor } from '../domain/money.js';
import { COUNTRIES, JOBS } from './reference.js';

export interface SeedEmployee {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salaryMinor: number;
  hireDate: string;
  status: 'active' | 'inactive';
}

/** Deterministic: the same (count, seed) always yields the same employees. */
export function generateEmployees(count: number, seed = 42): SeedEmployee[] {
  faker.seed(seed);
  const employees: SeedEmployee[] = [];
  for (let i = 0; i < count; i++) {
    const country = faker.helpers.arrayElement(COUNTRIES);
    const job = faker.helpers.arrayElement(JOBS);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    // +/-20% individual variation around the role/country baseline
    const variation = faker.number.float({ min: 0.8, max: 1.2 });
    const localSalary = Math.round(job.baseUsd * country.payFactor * variation * country.localPerUsd);
    employees.push({
      firstName,
      lastName,
      // index in the email guarantees uniqueness
      email: `${firstName}.${lastName}.${i}@acme.example`.toLowerCase().replace(/[^a-z0-9.@_-]/g, ''),
      jobTitle: job.title,
      department: job.department,
      country: country.name,
      currency: country.currency,
      salaryMinor: toMinor(localSalary),
      hireDate: faker.date.between({ from: '2015-01-01', to: '2025-12-31' }).toISOString().slice(0, 10),
      status: faker.number.int({ min: 1, max: 100 }) <= 95 ? 'active' : 'inactive',
    });
  }
  return employees;
}
