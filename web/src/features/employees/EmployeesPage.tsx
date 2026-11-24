import { Alert, Box, Button, Paper, Stack, TablePagination, Typography } from '@mui/material'
import { useState } from 'react'
import { DEFAULT_LIST_PARAMS, useEmployees, useFacets, type EmployeeListParams } from '../../api/employees'
import type { SortKey } from '../../api/types'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { EmployeeFilters, type FilterValues } from './EmployeeFilters'
import { EmployeesTable } from './EmployeesTable'

const PAGE_SIZES = [10, 25, 50, 100]

export function EmployeesPage() {
  const [params, setParams] = useState<EmployeeListParams>(DEFAULT_LIST_PARAMS)
  // The input updates instantly; the request only fires after the user pauses typing.
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  const query = useEmployees({ ...params, search: debouncedSearch })
  const facets = useFacets()

  // Pick filter fields explicitly: spreading params would leak sort/page into "has filters".
  const filterValues: FilterValues = {
    search: searchInput,
    country: params.country,
    department: params.department,
    jobTitle: params.jobTitle,
    status: params.status,
  }

  const changeFilters = (patch: Partial<FilterValues>) => {
    if (patch.search !== undefined) setSearchInput(patch.search)
    const { search: _search, ...rest } = patch
    setParams((current) => ({ ...current, ...rest, page: 1 })) // any filter change returns to page 1
  }

  const clearFilters = () => {
    setSearchInput('')
    setParams((current) => ({ ...DEFAULT_LIST_PARAMS, sortBy: current.sortBy, sortDir: current.sortDir, pageSize: current.pageSize }))
  }

  const changeSort = (key: SortKey) =>
    setParams((current) => ({
      ...current,
      sortBy: key,
      sortDir: current.sortBy === key && current.sortDir === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Employees
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {query.data ? `${query.data.total.toLocaleString()} employees` : 'Loading…'}
        </Typography>
      </Box>

      <EmployeeFilters values={filterValues} facets={facets.data} onChange={changeFilters} onClear={clearFilters} />

      {query.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Could not load employees: {query.error.message}
        </Alert>
      ) : (
        <Paper variant="outlined" sx={{ opacity: query.isPlaceholderData ? 0.6 : 1, transition: 'opacity 120ms' }}>
          <EmployeesTable
            employees={query.data?.items ?? []}
            sortBy={params.sortBy}
            sortDir={params.sortDir}
            onSortChange={changeSort}
            loading={query.isPending}
          />
          <TablePagination
            component="div"
            count={query.data?.total ?? 0}
            page={params.page - 1}
            rowsPerPage={params.pageSize}
            rowsPerPageOptions={PAGE_SIZES}
            onPageChange={(_event, page) => setParams((current) => ({ ...current, page: page + 1 }))}
            onRowsPerPageChange={(event) =>
              setParams((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))
            }
          />
        </Paper>
      )}
    </Stack>
  )
}
