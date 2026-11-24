import { Paper, Typography } from '@mui/material'
import type { ReactNode } from 'react'

/** Small hover card shared by every chart: title line + detail rows in text tokens. */
export function ChartTooltip({ title, rows }: { title: string; rows: [label: string, value: ReactNode][] }) {
  return (
    <Paper elevation={3} sx={{ p: 1.25, minWidth: 180 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      {rows.map(([label, value]) => (
        <Typography key={label} variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <span style={{ color: '#52514e' }}>{label}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </Typography>
      ))}
    </Paper>
  )
}
