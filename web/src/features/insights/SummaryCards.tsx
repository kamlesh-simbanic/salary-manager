import { Box, Paper, Skeleton, Typography } from '@mui/material'
import type { PayStats } from '../../api/types'
import { formatUsd } from '../../lib/format'

interface Props {
  stats?: PayStats
}

/** Headline numbers. Median is first: it is the fairest "typical pay" figure, unlike the mean. */
export function SummaryCards({ stats }: Props) {
  const cards: { label: string; value?: string; hint?: string }[] = [
    { label: 'Employees', value: stats?.count.toLocaleString() },
    { label: 'Median salary', value: stats && formatUsd(stats.medianUsdMinor), hint: 'Typical pay' },
    { label: 'Average salary', value: stats && formatUsd(stats.meanUsdMinor), hint: 'Pulled up by high earners' },
    { label: 'Pay range', value: stats && `${formatUsd(stats.minUsdMinor, { compact: true })} – ${formatUsd(stats.maxUsdMinor, { compact: true })}` },
    { label: 'Total annual payroll', value: stats && formatUsd(stats.totalUsdMinor, { compact: true }) },
  ]
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
      {cards.map((card) => (
        <Paper key={card.label} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {card.label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {card.value ?? <Skeleton width={90} />}
          </Typography>
          {card.hint && (
            <Typography variant="caption" color="text.secondary">
              {card.hint}
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  )
}
