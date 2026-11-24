import { beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp, sampleEmployee, seedFxRates } from '../test/helpers.js';

describe('insights routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const ctx = buildTestApp();
    app = ctx.app;
    seedFxRates(ctx.db);
    const add = (overrides: object) => app.inject({ method: 'POST', url: '/api/employees', payload: sampleEmployee(overrides) });
    await add({ country: 'United States', currency: 'USD', salaryMinor: 10000 });
    await add({ country: 'United States', currency: 'USD', salaryMinor: 30000 });
    await add({ country: 'India', currency: 'INR', salaryMinor: 1_000_000 });
    await add({ country: 'India', currency: 'INR', salaryMinor: 5_000_000, status: 'inactive' });
  });

  it('GET /summary counts only active employees by default', async () => {
    const res = await app.inject({ url: '/api/insights/summary' });
    expect(res.json()).toMatchObject({ count: 3, minUsdMinor: 10000, maxUsdMinor: 30000, medianUsdMinor: 10000 });
  });

  it('GET /summary?status=inactive switches the population', async () => {
    const res = await app.inject({ url: '/api/insights/summary?status=inactive' });
    expect(res.json()).toMatchObject({ count: 1, medianUsdMinor: 50000 });
  });

  it('GET /by/country returns one row per country', async () => {
    const rows = (await app.inject({ url: '/api/insights/by/country' })).json();
    expect(rows.map((r: { key: string }) => r.key)).toEqual(['United States', 'India']);
  });

  it('GET /by/<unknown> returns 400', async () => {
    expect((await app.inject({ url: '/api/insights/by/salary_minor' })).statusCode).toBe(400);
  });

  it('GET /distribution returns contiguous buckets', async () => {
    const buckets = (await app.inject({ url: '/api/insights/distribution?bucketUsd=1000' })).json();
    expect(buckets.reduce((n: number, b: { count: number }) => n + b.count, 0)).toBe(3);
    expect(buckets[0]).toMatchObject({ fromUsdMinor: 0, toUsdMinor: 100000 });
  });

  it('GET /distribution rejects a tiny bucket size', async () => {
    expect((await app.inject({ url: '/api/insights/distribution?bucketUsd=1' })).statusCode).toBe(400);
  });

  it('GET /earners returns the top earner first and honours limit', async () => {
    const rows = (await app.inject({ url: '/api/insights/earners?limit=1' })).json();
    expect(rows).toHaveLength(1);
    expect(rows[0].salaryUsdMinor).toBe(30000);
    const bottom = (await app.inject({ url: '/api/insights/earners?order=bottom&limit=1' })).json();
    expect(bottom[0].salaryUsdMinor).toBe(10000);
  });
});
