import { Chip, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material'
import type { Employee, SortDir, SortKey } from '../../api/types'
import { formatDate, formatMoney } from '../../lib/format'

interface Column {
  label: string
  sortKey?: SortKey
  align?: 'right'
}

const COLUMNS: Column[] = [
  { label: 'Name', sortKey: 'lastName' },
  { label: 'Job title', sortKey: 'jobTitle' },
  { label: 'Department' },
  { label: 'Country', sortKey: 'country' },
  { label: 'Salary', sortKey: 'salary', align: 'right' },
  { label: 'Hired', sortKey: 'hireDate' },
  { label: 'Status' },
]

interface Props {
  employees: Employee[]
  sortBy: SortKey
  sortDir: SortDir
  onSortChange: (key: SortKey) => void
  loading?: boolean
}

/** Presentational: renders rows and reports sort clicks. Data fetching lives in the page. */
export function EmployeesTable({ employees, sortBy, sortDir, onSortChange, loading = false }: Props) {
  return (
    <Table size="small" aria-label="Employees">
      <TableHead>
        <TableRow>
          {COLUMNS.map((column) => (
            <TableCell
              key={column.label}
              align={column.align}
              sortDirection={column.sortKey === sortBy ? sortDir : false}
            >
              {column.sortKey ? (
                <TableSortLabel
                  active={column.sortKey === sortBy}
                  direction={column.sortKey === sortBy ? sortDir : 'asc'}
                  onClick={() => onSortChange(column.sortKey!)}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                column.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {loading &&
          Array.from({ length: 8 }, (_, i) => (
            <TableRow key={`skeleton-${i}`}>
              {COLUMNS.map((column) => (
                <TableCell key={column.label}>
                  <Skeleton />
                </TableCell>
              ))}
            </TableRow>
          ))}
        {!loading && employees.length === 0 && (
          <TableRow>
            <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
              <Typography color="text.secondary">No employees match these filters.</Typography>
            </TableCell>
          </TableRow>
        )}
        {!loading &&
          employees.map((employee) => (
            <TableRow key={employee.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {employee.firstName} {employee.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {employee.email}
                </Typography>
              </TableCell>
              <TableCell>{employee.jobTitle}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{employee.country}</TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(employee.salaryMinor, employee.currency)}
                <Typography component="span" variant="caption" color="text.secondary">
                  {' '}
                  {employee.currency}
                </Typography>
              </TableCell>
              <TableCell>{formatDate(employee.hireDate)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={employee.status}
                  color={employee.status === 'active' ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
