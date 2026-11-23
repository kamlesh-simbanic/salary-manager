import { describe, expect, it } from 'vitest';
import { fromMinor, toMinor, toUsdMinor } from './money.js';

describe('money', () => {
  it('converts to minor units without float drift', () => {
    expect(toMinor(19.99)).toBe(1999);
    expect(toMinor(0.1 + 0.2)).toBe(30);
  });
  it('round-trips minor units', () => {
    expect(fromMinor(toMinor(1234.56))).toBe(1234.56);
  });
  it('converts local minor units to USD minor units', () => {
    expect(toUsdMinor(8_300_000, 0.012)).toBe(99_600);
  });
});
