import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import type { Earner } from '../../api/types'
import { formatMoney, formatUsd } from '../../lib/format'

export function EarnersTable({ earners, label }: { earners: Earner[]; label: string }) {
  return (
    <Table size="small" aria-label={label}>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Country</TableCell>
          <TableCell align="right">Salary (USD)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {earners.map((e) => (
          <TableRow key={e.id} hover>
            <TableCell>
              {e.firstName} {e.lastName}
            </TableCell>
            <TableCell>{e.jobTitle}</TableCell>
            <TableCell>{e.country}</TableCell>
            <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatUsd(e.salaryUsdMinor)}
              {e.currency !== 'USD' && (
                <Typography component="div" variant="caption" color="text.secondary">
                  {formatMoney(e.salaryMinor, e.currency)}
                </Typography>
              )}
            </TableCell>
          </TableRow>
        ))}
        {earners.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
              <Typography color="text.secondary">No data.</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
