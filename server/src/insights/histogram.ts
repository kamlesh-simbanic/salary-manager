import type { BucketCount, DistributionBucket } from './insights.types.js';

/**
 * Turns sparse (index, count) rows into a continuous list of buckets, filling empty
 * ranges with 0 so a chart's x-axis has no gaps. Pure function: easy to test.
 */
export function fillBuckets(rows: BucketCount[], bucketSize: number): DistributionBucket[] {
  if (rows.length === 0) return [];
  const counts = new Map(rows.map((r) => [r.index, r.count]));
  const first = Math.min(...rows.map((r) => r.index));
  const last = Math.max(...rows.map((r) => r.index));
  const buckets: DistributionBucket[] = [];
  for (let i = first; i <= last; i++) {
    buckets.push({ fromUsdMinor: i * bucketSize, toUsdMinor: (i + 1) * bucketSize, count: counts.get(i) ?? 0 });
  }
  return buckets;
}
