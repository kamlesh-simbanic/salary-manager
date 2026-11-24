import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from './client'
import { buildQuery } from './query'
import type { Dimension, DistributionBucket, Earner, EmployeeStatus, GroupPayStats, PayStats } from './types'

export interface InsightsFilter {
  country: string
  department: string
  jobTitle: string
  status: EmployeeStatus
}

export const DEFAULT_INSIGHTS_FILTER: InsightsFilter = { country: '', department: '', jobTitle: '', status: 'active' }

const get = <T>(path: string, params: object) => api<T>(`/api/insights/${path}?${buildQuery(params)}`)
const options = { placeholderData: keepPreviousData } // keep old numbers visible while filters reload

export const useSummary = (filter: InsightsFilter) =>
  useQuery({ queryKey: ['insights', 'summary', filter], queryFn: () => get<PayStats>('summary', filter), ...options })

export const useGroupStats = (dimension: Dimension, filter: InsightsFilter) =>
  useQuery({ queryKey: ['insights', 'by', dimension, filter], queryFn: () => get<GroupPayStats[]>(`by/${dimension}`, filter), ...options })

export const useDistribution = (filter: InsightsFilter, bucketUsd: number) =>
  useQuery({
    queryKey: ['insights', 'distribution', filter, bucketUsd],
    queryFn: () => get<DistributionBucket[]>('distribution', { ...filter, bucketUsd }),
    ...options,
  })

export const useEarners = (filter: InsightsFilter, order: 'top' | 'bottom', limit = 10) =>
  useQuery({
    queryKey: ['insights', 'earners', filter, order, limit],
    queryFn: () => get<Earner[]>('earners', { ...filter, order, limit }),
    ...options,
  })
