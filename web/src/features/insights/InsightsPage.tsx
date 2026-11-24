import { Alert, Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useState, type ReactNode } from 'react'
import { useFacets } from '../../api/employees'
import { DEFAULT_INSIGHTS_FILTER, useDistribution, useEarners, useGroupStats, useSummary, type InsightsFilter } from '../../api/insights'
import type { Dimension } from '../../api/types'
import { FilterSelect } from '../../components/FilterSelect'
import { DistributionChart } from './DistributionChart'
import { EarnersTable } from './EarnersTable'
import { PayByGroupChart } from './PayByGroupChart'
import { PayByGroupTable } from './PayByGroupTable'
import { SummaryCards } from './SummaryCards'

const DIMENSIONS: { value: Dimension; label: string }[] = [
  { value: 'country', label: 'Country' },
  { value: 'department', label: 'Department' },
  { value: 'jobTitle', label: 'Job title' },
]

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      {children}
    </Paper>
  )
}

export function InsightsPage() {
  const [filter, setFilter] = useState<InsightsFilter>(DEFAULT_INSIGHTS_FILTER)
  const [dimension, setDimension] = useState<Dimension>('country')
  const [view, setView] = useState<'chart' | 'table'>('chart')

  const facets = useFacets()
  const summary = useSummary(filter)
  const groups = useGroupStats(dimension, filter)
  const distribution = useDistribution(filter, 20_000)
  const top = useEarners(filter, 'top')
  const bottom = useEarners(filter, 'bottom')

  const dimensionLabel = DIMENSIONS.find((d) => d.value === dimension)!.label
  const error = [summary, groups, distribution, top, bottom].find((q) => q.isError)?.error
  const update = (patch: Partial<InsightsFilter>) => setFilter((current) => ({ ...current, ...patch }))

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Pay insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          How the organisation pays people. All amounts are annual and converted to USD with static exchange rates so countries can be compared.
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterSelect label="Country" value={filter.country} options={facets.data?.countries ?? []} onChange={(country) => update({ country })} />
        <FilterSelect label="Department" value={filter.department} options={facets.data?.departments ?? []} onChange={(department) => update({ department })} />
        <FilterSelect label="Job title" value={filter.jobTitle} options={facets.data?.jobTitles ?? []} onChange={(jobTitle) => update({ jobTitle })} />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={filter.status}
          aria-label="Employee status"
          onChange={(_e, status) => status && update({ status })}
        >
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="inactive">Inactive</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {error && <Alert severity="error">Could not load insights: {error.message}</Alert>}

      <SummaryCards stats={summary.data} />

      <Section
        title={`Median salary by ${dimensionLabel.toLowerCase()}`}
        subtitle="Median is the middle salary: half earn more, half earn less."
        action={
          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup size="small" exclusive value={dimension} aria-label="Group by" onChange={(_e, v) => v && setDimension(v)}>
              {DIMENSIONS.map((d) => (
                <ToggleButton key={d.value} value={d.value}>
                  {d.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <ToggleButtonGroup size="small" exclusive value={view} aria-label="View" onChange={(_e, v) => v && setView(v)}>
              <ToggleButton value="chart">Chart</ToggleButton>
              <ToggleButton value="table">Table</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        }
      >
        {groups.data && groups.data.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No employees match these filters.
          </Typography>
        ) : view === 'chart' ? (
          <PayByGroupChart rows={groups.data ?? []} />
        ) : (
          <PayByGroupTable rows={groups.data ?? []} label={dimensionLabel} />
        )}
      </Section>

      <Section title="Salary distribution" subtitle="Number of employees in each $20K salary band.">
        <DistributionChart buckets={distribution.data ?? []} />
      </Section>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
        <Section title="Top 10 earners">
          <EarnersTable earners={top.data ?? []} label="Top earners" />
        </Section>
        <Section title="Lowest 10 earners">
          <EarnersTable earners={bottom.data ?? []} label="Lowest earners" />
        </Section>
      </Box>
    </Stack>
  )
}
