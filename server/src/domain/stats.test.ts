import { describe, expect, it } from 'vitest';
import { median, summarize } from './stats.js';

describe('median', () => {
  it('handles odd counts', () => expect(median([3, 1, 2])).toBe(2));
  it('averages the middle pair for even counts', () => expect(median([4, 1, 3, 2])).toBe(2.5));
  it('returns 0 for empty input', () => expect(median([])).toBe(0));
  it('does not mutate its input', () => {
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
  });
});

describe('summarize', () => {
  it('computes count, min, max, mean and median', () => {
    expect(summarize([10, 20, 30, 40])).toEqual({ count: 4, min: 10, max: 40, mean: 25, median: 25 });
  });
  it('returns zeros for empty input', () => {
    expect(summarize([])).toEqual({ count: 0, min: 0, max: 0, mean: 0, median: 0 });
  });
});
