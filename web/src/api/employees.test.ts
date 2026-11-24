import { describe, expect, it } from 'vitest'
import { DEFAULT_LIST_PARAMS, toQueryString } from './employees'

describe('toQueryString', () => {
  it('omits empty filters', () => {
    expect(toQueryString(DEFAULT_LIST_PARAMS)).toBe('sortBy=lastName&sortDir=asc&page=1&pageSize=25')
  })
  it('includes active filters and encodes them', () => {
    const qs = toQueryString({ ...DEFAULT_LIST_PARAMS, search: 'o&m', country: 'India', status: 'active' })
    expect(qs).toContain('search=o%26m')
    expect(qs).toContain('country=India')
    expect(qs).toContain('status=active')
  })
})
