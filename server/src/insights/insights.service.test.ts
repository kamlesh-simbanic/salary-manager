import { describe, expect, it } from 'vitest';
import type { InsightsReader } from './insights.repository.js';
import { InsightsService } from './insights.service.js';

/** The service only needs the abstraction, so a stub is enough: no database involved. */
function stubReader(overrides: Partial<InsightsReader> = {}): InsightsReader {
  return {
    summary: () => ({ count: 0, minUsdMinor: 0, medianUsdMinor: 0, meanUsdMinor: 0, maxUsdMinor: 0, totalUsdMinor: 0 }),
    statsBy: () => [],
    distribution: () => [],
    earners: () => [],
    ...overrides,
  };
}

describe('InsightsService.distribution', () => {
  it('converts the dollar bucket size to cents and fills empty buckets', () => {
    let receivedBucket = 0;
    const service = new InsightsService(
      stubReader({
        distribution: (_filter, bucket) => {
          receivedBucket = bucket;
          return [
            { index: 0, count: 2 },
            { index: 2, count: 1 },
          ];
        },
      }),
    );
    const result = service.distribution({}, 20_000);
    expect(receivedBucket).toBe(2_000_000);
    expect(result.map((b) => b.count)).toEqual([2, 0, 1]);
    expect(result[1]).toMatchObject({ fromUsdMinor: 2_000_000, toUsdMinor: 4_000_000 });
  });
});

describe('InsightsService pass-through queries', () => {
  it('forwards the filter and dimension to the reader', () => {
    const calls: unknown[] = [];
    const service = new InsightsService(
      stubReader({
        statsBy: (dimension, filter) => {
          calls.push([dimension, filter]);
          return [];
        },
      }),
    );
    service.by('department', { country: 'India' });
    expect(calls).toEqual([['department', { country: 'India' }]]);
  });
});
