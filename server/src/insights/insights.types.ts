/** All money in insights is normalised to USD minor units (cents) so countries are comparable. */
export const DIMENSIONS = ['country', 'department', 'jobTitle'] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export interface PayStats {
  count: number;
  minUsdMinor: number;
  medianUsdMinor: number;
  meanUsdMinor: number;
  maxUsdMinor: number;
  totalUsdMinor: number;
}

export interface GroupPayStats extends PayStats {
  key: string;
}

/** Raw histogram row: bucket index (0 = [0, size)) and how many employees fall in it. */
export interface BucketCount {
  index: number;
  count: number;
}

export interface DistributionBucket {
  fromUsdMinor: number;
  toUsdMinor: number;
  count: number;
}

export type EarnerOrder = 'top' | 'bottom';

export interface Earner {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salaryMinor: number;
  salaryUsdMinor: number;
}
