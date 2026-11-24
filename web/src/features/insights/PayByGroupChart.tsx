import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GroupPayStats } from '../../api/types'
import { formatUsd } from '../../lib/format'
import { AXIS_PROPS, BAR_COLOR, GRID_COLOR, HOVER_BAND } from './chartTheme'
import { ChartTooltip } from './ChartTooltip'

const ROW_HEIGHT = 30

/** Horizontal bars of median salary, one per group. Thin bars, rounded tips, value at the tip. */
export function PayByGroupChart({ rows }: { rows: GroupPayStats[] }) {
  return (
    <div role="img" aria-label={`Median salary by group. Highest: ${rows[0]?.key ?? 'none'}.`}>
      <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT + 40}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 8 }}>
          <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
          <XAxis type="number" tickFormatter={(v: number) => formatUsd(v, { compact: true })} {...AXIS_PROPS} />
          <YAxis type="category" dataKey="key" width={170} {...AXIS_PROPS} />
          <Tooltip
            cursor={{ fill: HOVER_BAND }}
            content={({ active, payload }) => {
              const row = active ? (payload?.[0]?.payload as GroupPayStats | undefined) : undefined
              if (!row) return null
              return (
                <ChartTooltip
                  title={row.key}
                  rows={[
                    ['Employees', row.count.toLocaleString()],
                    ['Median', formatUsd(row.medianUsdMinor)],
                    ['Average', formatUsd(row.meanUsdMinor)],
                    ['Lowest', formatUsd(row.minUsdMinor)],
                    ['Highest', formatUsd(row.maxUsdMinor)],
                  ]}
                />
              )
            }}
          />
          <Bar dataKey="medianUsdMinor" fill={BAR_COLOR} barSize={16} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList dataKey="medianUsdMinor" position="right" formatter={(v: unknown) => formatUsd(Number(v), { compact: true })} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
