import { beforeEach, describe, expect, it } from 'vitest';
import { createDb } from '../db/index.js';
import { SqliteEmployeeRepository } from '../employees/sqlite-employee.repository.js';
import { sampleEmployee, seedFxRates } from '../test/helpers.js';
import { SqliteInsightsRepository } from './sqlite-insights.repository.js';

/**
 * Fixture (USD minor units after conversion; INR rate = 0.01 USD):
 *   US: 10000, 20000, 30000, 40000          -> median 25000, mean 25000
 *   IN: 1_000_000 and 3_000_000 paise       -> 10000 and 30000 USD, median 20000
 *   US inactive: 99999 (excluded when filtering active)
 */
describe('SqliteInsightsRepository', () => {
  let repo: SqliteInsightsRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedFxRates(db);
    const employees = new SqliteEmployeeRepository(db);
    const add = (country: string, currency: string, salaryMinor: number, extra = {}) =>
      employees.insert(sampleEmployee({ country, currency, salaryMinor, ...extra }));
    [10000, 20000, 30000, 40000].forEach((s) => add('United States', 'USD', s, { department: 'Engineering' }));
    [1_000_000, 3_000_000].forEach((s) => add('India', 'INR', s, { department: 'Sales' }));
    add('United States', 'USD', 99999, { status: 'inactive', department: 'Engineering' });
    repo = new SqliteInsightsRepository(db);
  });

  const active = { status: 'active' as const };

  it('summarises all active employees in USD', () => {
    expect(repo.summary(active)).toEqual({
      count: 6,
      minUsdMinor: 10000,
      medianUsdMinor: 25000,
      meanUsdMinor: 23333,
      maxUsdMinor: 40000,
      totalUsdMinor: 140000,
    });
  });

  it('returns zeros when nothing matches', () => {
    expect(repo.summary({ country: 'Nowhere' }).count).toBe(0);
  });

  it('computes per-country stats, highest median first', () => {
    const rows = repo.statsBy('country', active);
    expect(rows.map((r) => r.key)).toEqual(['United States', 'India']);
    expect(rows[0]).toMatchObject({ count: 4, minUsdMinor: 10000, maxUsdMinor: 40000, medianUsdMinor: 25000 });
    expect(rows[1]).toMatchObject({ count: 2, medianUsdMinor: 20000, meanUsdMinor: 20000 });
  });

  it('uses the single value as the median for a group of one', () => {
    expect(repo.summary({ status: 'inactive' })).toMatchObject({ count: 1, medianUsdMinor: 99999 });
  });

  it('narrows stats with filters', () => {
    const rows = repo.statsBy('country', { status: 'active', department: 'Sales' });
    expect(rows.map((r) => r.key)).toEqual(['India']);
  });

  it('groups by department and job title', () => {
    expect(repo.statsBy('department', active).map((r) => r.key).sort()).toEqual(['Engineering', 'Sales']);
    expect(repo.statsBy('jobTitle', active)).toHaveLength(1);
  });

  it('includes inactive employees when no status filter is given', () => {
    expect(repo.summary({}).count).toBe(7);
  });

  it('buckets salaries for a histogram', () => {
    // bucket = 20000 cents: [10000,10000,30000,... ] -> idx0: 10000,10000 ; idx1: 20000,30000,30000 ; idx2: 40000
    expect(repo.distribution(active, 20000)).toEqual([
      { index: 0, count: 2 },
      { index: 1, count: 3 },
      { index: 2, count: 1 },
    ]);
  });

  it('lists top and bottom earners with USD values', () => {
    const [top] = repo.earners(active, 'top', 1);
    expect(top).toMatchObject({ salaryUsdMinor: 40000, country: 'United States' });
    const [bottom] = repo.earners(active, 'bottom', 1);
    expect(bottom.salaryUsdMinor).toBe(10000);
    expect(repo.earners(active, 'top', 3)).toHaveLength(3);
  });

  it('excludes employees whose currency has no FX rate instead of mis-converting them', () => {
    const db = createDb(':memory:');
    seedFxRates(db, { USD: 1 });
    const employees = new SqliteEmployeeRepository(db);
    employees.insert(sampleEmployee({ currency: 'USD', salaryMinor: 100 }));
    employees.insert(sampleEmployee({ currency: 'XYZ', salaryMinor: 999 }));
    expect(new SqliteInsightsRepository(db).summary({}).count).toBe(1);
  });
});
