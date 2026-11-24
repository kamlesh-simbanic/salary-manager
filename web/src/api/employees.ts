import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { Employee, EmployeeFacets, EmployeeStatus, Page, SortDir, SortKey } from './types'

export interface EmployeeListParams {
  search: string
  country: string
  department: string
  jobTitle: string
  status: EmployeeStatus | ''
  sortBy: SortKey
  sortDir: SortDir
  /** 1-based, as in the API. */
  page: number
  pageSize: number
}

export const DEFAULT_LIST_PARAMS: EmployeeListParams = {
  search: '',
  country: '',
  department: '',
  jobTitle: '',
  status: '',
  sortBy: 'lastName',
  sortDir: 'asc',
  page: 1,
  pageSize: 25,
}

/** Drops empty values so the URL only carries active filters. */
export function toQueryString(params: EmployeeListParams): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== undefined) query.set(key, String(value))
  }
  return query.toString()
}

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => api<Page<Employee>>(`/api/employees?${toQueryString(params)}`),
    placeholderData: keepPreviousData, // keep showing the old page while the next one loads
  })
}

export function useFacets() {
  return useQuery({
    queryKey: ['employee-facets'],
    queryFn: () => api<EmployeeFacets>('/api/employees/facets'),
    staleTime: 5 * 60_000,
  })
}
