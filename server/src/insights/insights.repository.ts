import type { EmployeeFilter } from '../employees/employee.types.js';
import type { BucketCount, Dimension, Earner, EarnerOrder, GroupPayStats, PayStats } from './insights.types.js';

/** Read-only by design: insights can never modify data (Interface Segregation). */
export interface InsightsReader {
  summary(filter: EmployeeFilter): PayStats;
  statsBy(dimension: Dimension, filter: EmployeeFilter): GroupPayStats[];
  distribution(filter: EmployeeFilter, bucketSizeUsdMinor: number): BucketCount[];
  earners(filter: EmployeeFilter, order: EarnerOrder, limit: number): Earner[];
}
