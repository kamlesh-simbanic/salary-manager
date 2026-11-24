import { beforeEach, describe, expect, it } from 'vitest';
import { createDb } from '../db/index.js';
import { sampleEmployee } from '../test/helpers.js';
import { SqliteEmployeeRepository } from './sqlite-employee.repository.js';
import type { EmployeeListQuery } from './employee.types.js';

const query = (overrides: Partial<EmployeeListQuery> = {}): EmployeeListQuery => ({
  sortBy: 'lastName',
  sortDir: 'asc',
  page: 1,
  pageSize: 25,
  ...overrides,
});

describe('SqliteEmployeeRepository', () => {
  let repo: SqliteEmployeeRepository;
  beforeEach(() => {
    repo = new SqliteEmployeeRepository(createDb(':memory:'));
  });

  it('inserts and finds by id and email', () => {
    const created = repo.insert(sampleEmployee({ email: 'a@x.example' }));
    expect(repo.findById(created.id)).toEqual(created);
    expect(repo.findByEmail('a@x.example')?.id).toBe(created.id);
    expect(repo.findById(999)).toBeUndefined();
  });

  it('updates only the given fields', () => {
    const created = repo.insert(sampleEmployee({ jobTitle: 'Engineer' }));
    const updated = repo.update(created.id, { salaryMinor: 42 });
    expect(updated).toMatchObject({ salaryMinor: 42, jobTitle: 'Engineer' });
  });

  it('returns sorted distinct facet values', () => {
    repo.insert(sampleEmployee({ country: 'India', department: 'Sales', jobTitle: 'Rep' }));
    repo.insert(sampleEmployee({ country: 'India', department: 'Engineering', jobTitle: 'Dev' }));
    repo.insert(sampleEmployee({ country: 'Germany', department: 'Sales', jobTitle: 'Rep' }));
    expect(repo.facets()).toEqual({
      countries: ['Germany', 'India'],
      departments: ['Engineering', 'Sales'],
      jobTitles: ['Dev', 'Rep'],
    });
  });

  it('deletes and reports whether a row existed', () => {
    const created = repo.insert(sampleEmployee());
    expect(repo.delete(created.id)).toBe(true);
    expect(repo.delete(created.id)).toBe(false);
  });

  describe('list', () => {
    beforeEach(() => {
      repo.insert(sampleEmployee({ lastName: 'Adams', country: 'India', department: 'Engineering', salaryMinor: 300 }));
      repo.insert(sampleEmployee({ lastName: 'Brown', country: 'Germany', department: 'Sales', salaryMinor: 100 }));
      repo.insert(sampleEmployee({ lastName: 'Clark', country: 'India', department: 'Sales', salaryMinor: 200, status: 'inactive' }));
    });

    it('filters by country and department together', () => {
      const page = repo.list(query({ country: 'India', department: 'Sales' }));
      expect(page.items.map((e) => e.lastName)).toEqual(['Clark']);
      expect(page.total).toBe(1);
    });

    it('filters by status', () => {
      expect(repo.list(query({ status: 'inactive' })).total).toBe(1);
    });

    it('searches name and email case-insensitively', () => {
      expect(repo.list(query({ search: 'bRoW' })).items.map((e) => e.lastName)).toEqual(['Brown']);
    });

    it('treats LIKE wildcards in search literally', () => {
      expect(repo.list(query({ search: '%' })).total).toBe(0);
    });

    it('sorts by salary descending', () => {
      const page = repo.list(query({ sortBy: 'salary', sortDir: 'desc' }));
      expect(page.items.map((e) => e.salaryMinor)).toEqual([300, 200, 100]);
    });

    it('paginates and reports the total independent of page size', () => {
      const page2 = repo.list(query({ page: 2, pageSize: 2 }));
      expect(page2.items.map((e) => e.lastName)).toEqual(['Clark']);
      expect(page2.total).toBe(3);
    });

    it('returns an empty page past the end', () => {
      expect(repo.list(query({ page: 9 })).items).toEqual([]);
    });
  });
});
