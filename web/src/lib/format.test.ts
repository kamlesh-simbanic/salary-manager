import { describe, expect, it } from 'vitest'
import { formatDate, formatMoney, formatUsd } from './format'

describe('formatMoney', () => {
  it('formats minor units in the given currency', () => {
    expect(formatMoney(15_000_000, 'USD')).toBe('$150,000')
    expect(formatMoney(1_500_000_00, 'INR')).toBe('₹1,500,000')
  })
  it('shows cents on request', () => {
    expect(formatMoney(123_456, 'USD', { cents: true })).toBe('$1,234.56')
  })
})

describe('formatDate', () => {
  it('does not shift the day with the local timezone', () => {
    expect(formatDate('2022-04-01')).toBe('Apr 1, 2022')
    expect(formatDate('2024-12-31')).toBe('Dec 31, 2024')
  })
})

describe('formatUsd', () => {
  it('formats cents as whole dollars', () => expect(formatUsd(8_475_400)).toBe('$84,754'))
  it('has a compact form for chart axes', () => {
    expect(formatUsd(8_500_000, { compact: true })).toBe('$85K')
    expect(formatUsd(1_250_000_000, { compact: true })).toBe('$12.5M')
  })
})
