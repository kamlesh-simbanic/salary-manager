import SearchIcon from '@mui/icons-material/Search'
import { Button, InputAdornment, Stack, TextField } from '@mui/material'
import { FilterSelect } from '../../components/FilterSelect'
import type { EmployeeFacets, EmployeeStatus } from '../../api/types'

export interface FilterValues {
  search: string
  country: string
  department: string
  jobTitle: string
  status: EmployeeStatus | ''
}

interface Props {
  values: FilterValues
  facets?: EmployeeFacets
  onChange: (patch: Partial<FilterValues>) => void
  onClear: () => void
}

export function EmployeeFilters({ values, facets, onChange, onClear }: Props) {
  const hasFilters = Object.values(values).some((v) => v !== '')
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        size="small"
        label="Search name or email"
        value={values.search}
        onChange={(e) => onChange({ search: e.target.value })}
        sx={{ minWidth: 260 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <FilterSelect label="Country" value={values.country} options={facets?.countries ?? []} onChange={(country) => onChange({ country })} />
      <FilterSelect
        label="Department"
        value={values.department}
        options={facets?.departments ?? []}
        onChange={(department) => onChange({ department })}
      />
      <FilterSelect label="Job title" value={values.jobTitle} options={facets?.jobTitles ?? []} onChange={(jobTitle) => onChange({ jobTitle })} />
      <FilterSelect
        label="Status"
        value={values.status}
        options={['active', 'inactive']}
        onChange={(status) => onChange({ status: status as EmployeeStatus | '' })}
      />
      {hasFilters && (
        <Button size="small" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </Stack>
  )
}
