import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import type { GroupPayStats } from '../../api/types'
import { formatUsd } from '../../lib/format'

/** Table view of the same data as the chart: the accessible, exact alternative. */
export function PayByGroupTable({ rows, label }: { rows: GroupPayStats[]; label: string }) {
  return (
    <Table size="small" aria-label={`Pay by ${label}`}>
      <TableHead>
        <TableRow>
          <TableCell>{label}</TableCell>
          <TableCell align="right">Employees</TableCell>
          <TableCell align="right">Lowest</TableCell>
          <TableCell align="right">Median</TableCell>
          <TableCell align="right">Average</TableCell>
          <TableCell align="right">Highest</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key} hover>
            <TableCell>{row.key}</TableCell>
            <TableCell align="right">{row.count.toLocaleString()}</TableCell>
            <TableCell align="right">{formatUsd(row.minUsdMinor)}</TableCell>
            <TableCell align="right">{formatUsd(row.medianUsdMinor)}</TableCell>
            <TableCell align="right">{formatUsd(row.meanUsdMinor)}</TableCell>
            <TableCell align="right">{formatUsd(row.maxUsdMinor)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
