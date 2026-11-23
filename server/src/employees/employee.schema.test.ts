import { describe, expect, it } from 'vitest';
import { listQuerySchema, newEmployeeSchema, updateEmployeeSchema } from './employee.schema.js';
import { sampleEmployee } from '../test/helpers.js';

describe('newEmployeeSchema', () => {
  it('accepts a valid employee and normalises the email', () => {
    const parsed = newEmployeeSchema.parse({ ...sampleEmployee(), email: '  Asha@ACME.example ' });
    expect(parsed.email).toBe('asha@acme.example');
  });
  it('defaults status to active', () => {
    const { status: _status, ...rest } = sampleEmployee();
    expect(newEmployeeSchema.parse(rest).status).toBe('active');
  });
  it.each([
    ['negative salary', { salaryMinor: -1 }],
    ['fractional salary', { salaryMinor: 10.5 }],
    ['bad currency', { currency: 'rupees' }],
    ['bad date', { hireDate: '2022-13-45' }],
    ['bad email', { email: 'nope' }],
    ['blank name', { firstName: '   ' }],
  ])('rejects %s', (_label, override) => {
    expect(() => newEmployeeSchema.parse({ ...sampleEmployee(), ...override })).toThrow();
  });
});

describe('updateEmployeeSchema', () => {
  it('allows a partial body and does not inject defaults', () => {
    expect(updateEmployeeSchema.parse({ salaryMinor: 5 })).toEqual({ salaryMinor: 5 });
  });
});

describe('listQuerySchema', () => {
  it('applies defaults and coerces numeric strings', () => {
    expect(listQuerySchema.parse({ page: '2', pageSize: '10' })).toMatchObject({
      page: 2,
      pageSize: 10,
      sortBy: 'lastName',
      sortDir: 'asc',
    });
  });
  it('caps page size and rejects unknown sort keys', () => {
    expect(() => listQuerySchema.parse({ pageSize: '1000' })).toThrow();
    expect(() => listQuerySchema.parse({ sortBy: 'salary_minor; DROP TABLE employees' })).toThrow();
  });
});
