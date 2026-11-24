import type { EmployeeFilter } from '../employees/employee.types.js';
import { fillBuckets } from './histogram.js';
import type { InsightsReader } from './insights.repository.js';
import type {
  Dimension,
  DistributionBucket,
  Earner,
  EarnerOrder,
  GroupPayStats,
  PayStats,
} from './insights.types.js';

/** Answers "how do we pay people?". Depends on the InsightsReader abstraction only. */
export class InsightsService {
  constructor(private readonly reader: InsightsReader) {}

  summary(filter: EmployeeFilter): PayStats {
    return this.reader.summary(filter);
  }

  by(dimension: Dimension, filter: EmployeeFilter): GroupPayStats[] {
    return this.reader.statsBy(dimension, filter);
  }

  /** `bucketSizeUsd` is in whole dollars (API-friendly); storage uses cents. */
  distribution(filter: EmployeeFilter, bucketSizeUsd: number): DistributionBucket[] {
    const bucketSize = bucketSizeUsd * 100;
    return fillBuckets(this.reader.distribution(filter, bucketSize), bucketSize);
  }

  earners(filter: EmployeeFilter, order: EarnerOrder, limit: number): Earner[] {
    return this.reader.earners(filter, order, limit);
  }
}
