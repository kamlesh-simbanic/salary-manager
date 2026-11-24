import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DistributionBucket } from '../../api/types'
import { formatUsd } from '../../lib/format'
import { AXIS_PROPS, BAR_COLOR, GRID_COLOR, HOVER_BAND } from './chartTheme'
import { ChartTooltip } from './ChartTooltip'

/** Columns: how many employees fall in each salary band. */
export function DistributionChart({ buckets }: { buckets: DistributionBucket[] }) {
  const mostCommon = buckets.reduce<DistributionBucket | undefined>((best, b) => (!best || b.count > best.count ? b : best), undefined)
  return (
    <div
      role="img"
      aria-label={
        mostCommon
          ? `Salary distribution. Most common band: ${formatUsd(mostCommon.fromUsdMinor, { compact: true })} to ${formatUsd(mostCommon.toUsdMinor, { compact: true })}.`
          : 'Salary distribution, no data.'
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={buckets} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID_COLOR} />
          <XAxis dataKey="fromUsdMinor" tickFormatter={(v: number) => formatUsd(v, { compact: true })} {...AXIS_PROPS} />
          <YAxis allowDecimals={false} width={48} {...AXIS_PROPS} />
          <Tooltip
            cursor={{ fill: HOVER_BAND }}
            content={({ active, payload }) => {
              const bucket = active ? (payload?.[0]?.payload as DistributionBucket | undefined) : undefined
              if (!bucket) return null
              return (
                <ChartTooltip
                  title={`${formatUsd(bucket.fromUsdMinor, { compact: true })} – ${formatUsd(bucket.toUsdMinor, { compact: true })}`}
                  rows={[['Employees', bucket.count.toLocaleString()]]}
                />
              )
            }}
          />
          <Bar dataKey="count" fill={BAR_COLOR} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
