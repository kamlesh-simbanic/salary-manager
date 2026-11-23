import { beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp, sampleEmployee } from '../test/helpers.js';

describe('employee routes', () => {
  let app: FastifyInstance;
  beforeEach(() => {
    app = buildTestApp().app;
  });

  const create = (overrides = {}) =>
    app.inject({ method: 'POST', url: '/api/employees', payload: sampleEmployee(overrides) });

  it('GET /api/health', async () => {
    const res = await app.inject({ url: '/api/health' });
    expect(res.json()).toEqual({ status: 'ok' });
  });

  it('POST creates (201) and GET by id returns it', async () => {
    const created = await create();
    expect(created.statusCode).toBe(201);
    const { id } = created.json();
    const res = await app.inject({ url: `/api/employees/${id}` });
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(id);
  });

  it('POST with invalid data returns 400 with field details', async () => {
    const res = await create({ salaryMinor: -5 });
    expect(res.statusCode).toBe(400);
    expect(res.json().details[0].path).toBe('salaryMinor');
  });

  it('POST with a duplicate email returns 409', async () => {
    await create({ email: 'same@x.example' });
    expect((await create({ email: 'same@x.example' })).statusCode).toBe(409);
  });

  it('GET unknown employee returns 404', async () => {
    expect((await app.inject({ url: '/api/employees/999' })).statusCode).toBe(404);
  });

  it('GET list supports filters, sort and pagination', async () => {
    await create({ lastName: 'Zed', country: 'India' });
    await create({ lastName: 'Abe', country: 'India' });
    await create({ lastName: 'Mid', country: 'Germany' });
    const res = await app.inject({ url: '/api/employees?country=India&sortBy=lastName&sortDir=desc&pageSize=1' });
    const body = res.json();
    expect(body.total).toBe(2);
    expect(body.items.map((e: { lastName: string }) => e.lastName)).toEqual(['Zed']);
  });

  it('GET list rejects invalid query params with 400', async () => {
    expect((await app.inject({ url: '/api/employees?pageSize=5000' })).statusCode).toBe(400);
  });

  it('PATCH updates the salary and the history shows the reason', async () => {
    const { id } = (await create({ salaryMinor: 100 })).json();
    const patch = await app.inject({
      method: 'PATCH',
      url: `/api/employees/${id}`,
      payload: { salaryMinor: 200, reason: 'Annual review' },
    });
    expect(patch.json().salaryMinor).toBe(200);
    const history = (await app.inject({ url: `/api/employees/${id}/salary-history` })).json();
    expect(history[0]).toMatchObject({ oldSalaryMinor: 100, newSalaryMinor: 200, reason: 'Annual review' });
  });

  it('DELETE returns 204 then 404', async () => {
    const { id } = (await create()).json();
    expect((await app.inject({ method: 'DELETE', url: `/api/employees/${id}` })).statusCode).toBe(204);
    expect((await app.inject({ method: 'DELETE', url: `/api/employees/${id}` })).statusCode).toBe(404);
  });
});
