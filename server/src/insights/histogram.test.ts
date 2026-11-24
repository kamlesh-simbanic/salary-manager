import { describe, expect, it } from 'vitest';
import { fillBuckets } from './histogram.js';

describe('fillBuckets', () => {
  it('returns nothing for no data', () => {
    expect(fillBuckets([], 100)).toEqual([]);
  });
  it('maps bucket indexes to value ranges', () => {
    expect(fillBuckets([{ index: 2, count: 5 }], 100)).toEqual([{ fromUsdMinor: 200, toUsdMinor: 300, count: 5 }]);
  });
  it('fills gaps between populated buckets with zero counts', () => {
    const result = fillBuckets(
      [
        { index: 1, count: 3 },
        { index: 4, count: 1 },
      ],
      10,
    );
    expect(result.map((b) => b.count)).toEqual([3, 0, 0, 1]);
    expect(result[0].fromUsdMinor).toBe(10);
    expect(result[3].toUsdMinor).toBe(50);
  });
});
