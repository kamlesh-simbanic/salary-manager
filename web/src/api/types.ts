// Mirrors the server's JSON contract. Money is always integer minor units (e.g. cents).
export type EmployeeStatus = 'active' | 'inactive'
export const SORT_KEYS = ['lastName', 'salary', 'hireDate', 'country', 'jobTitle'] as const
export type SortKey = (typeof SORT_KEYS)[number]
export type SortDir = 'asc' | 'desc'

export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  department: string
  country: string
  currency: string
  salaryMinor: number
  hireDate: string
  status: EmployeeStatus
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface EmployeeFacets {
  countries: string[]
  departments: string[]
  jobTitles: string[]
}

// ---- Insights (all money normalised to USD minor units / cents) ----
export type Dimension = 'country' | 'department' | 'jobTitle'

export interface PayStats {
  count: number
  minUsdMinor: number
  medianUsdMinor: number
  meanUsdMinor: number
  maxUsdMinor: number
  totalUsdMinor: number
}

export interface GroupPayStats extends PayStats {
  key: string
}

export interface DistributionBucket {
  fromUsdMinor: number
  toUsdMinor: number
  count: number
}

export interface Earner {
  id: number
  firstName: string
  lastName: string
  jobTitle: string
  department: string
  country: string
  currency: string
  salaryMinor: number
  salaryUsdMinor: number
}
