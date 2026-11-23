import { describe, expect, it } from 'vitest';
import { createDb } from '../db/index.js';
import { generateEmployees } from './generate.js';
import { seedDatabase } from './seed.js';

describe('generateEmployees', () => {
  it('is deterministic for the same seed', () => {
    expect(generateEmployees(50, 7)).toEqual(generateEmployees(50, 7));
  });
  it('produces unique emails', () => {
    const emails = generateEmployees(500).map((e) => e.email);
    expect(new Set(emails).size).toBe(500);
  });
  it('uses a currency consistent with the country', () => {
    for (const e of generateEmployees(200)) {
      if (e.country === 'India') expect(e.currency).toBe('INR');
      if (e.country === 'United States') expect(e.currency).toBe('USD');
    }
  });
  it('produces positive integer salaries', () => {
    for (const e of generateEmployees(200)) {
      expect(Number.isInteger(e.salaryMinor)).toBe(true);
      expect(e.salaryMinor).toBeGreaterThan(0);
    }
  });
});

describe('seedDatabase', () => {
  it('inserts the requested rows plus one history row each and FX rates', () => {
    const db = createDb();
    seedDatabase(db, 100);
    const count = (t: string) => (db.prepare(`SELECT COUNT(*) n FROM ${t}`).get() as { n: number }).n;
    expect(count('employees')).toBe(100);
    expect(count('salary_history')).toBe(100);
    expect(count('fx_rates')).toBeGreaterThan(0);
  });
  it('is idempotent', () => {
    const db = createDb();
    seedDatabase(db, 50);
    seedDatabase(db, 50);
    expect((db.prepare('SELECT COUNT(*) n FROM employees').get() as { n: number }).n).toBe(50);
  });
});
