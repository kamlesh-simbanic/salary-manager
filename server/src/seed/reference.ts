export interface CountryInfo {
  name: string;
  currency: string;
  /** Local-currency units per 1 USD (static, for deterministic seeds). */
  localPerUsd: number;
  /** Pay multiplier vs. a US baseline, in USD terms. */
  payFactor: number;
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'United States', currency: 'USD', localPerUsd: 1, payFactor: 1.0 },
  { name: 'United Kingdom', currency: 'GBP', localPerUsd: 0.79, payFactor: 0.8 },
  { name: 'Germany', currency: 'EUR', localPerUsd: 0.92, payFactor: 0.78 },
  { name: 'France', currency: 'EUR', localPerUsd: 0.92, payFactor: 0.72 },
  { name: 'India', currency: 'INR', localPerUsd: 83, payFactor: 0.3 },
  { name: 'Canada', currency: 'CAD', localPerUsd: 1.36, payFactor: 0.85 },
  { name: 'Australia', currency: 'AUD', localPerUsd: 1.52, payFactor: 0.88 },
  { name: 'Singapore', currency: 'SGD', localPerUsd: 1.34, payFactor: 0.9 },
];

export interface JobInfo {
  title: string;
  department: string;
  /** Baseline annual salary in USD for the US. */
  baseUsd: number;
}

export const JOBS: JobInfo[] = [
  { title: 'Software Engineer', department: 'Engineering', baseUsd: 110_000 },
  { title: 'Senior Software Engineer', department: 'Engineering', baseUsd: 150_000 },
  { title: 'Engineering Manager', department: 'Engineering', baseUsd: 185_000 },
  { title: 'QA Engineer', department: 'Engineering', baseUsd: 85_000 },
  { title: 'Product Manager', department: 'Product', baseUsd: 135_000 },
  { title: 'Product Designer', department: 'Design', baseUsd: 105_000 },
  { title: 'Data Analyst', department: 'Data', baseUsd: 90_000 },
  { title: 'Data Scientist', department: 'Data', baseUsd: 130_000 },
  { title: 'Sales Executive', department: 'Sales', baseUsd: 75_000 },
  { title: 'Account Manager', department: 'Sales', baseUsd: 85_000 },
  { title: 'Marketing Specialist', department: 'Marketing', baseUsd: 70_000 },
  { title: 'HR Specialist', department: 'People', baseUsd: 65_000 },
  { title: 'Recruiter', department: 'People', baseUsd: 68_000 },
  { title: 'Financial Analyst', department: 'Finance', baseUsd: 80_000 },
  { title: 'Accountant', department: 'Finance', baseUsd: 70_000 },
  { title: 'Customer Support Agent', department: 'Support', baseUsd: 45_000 },
];
