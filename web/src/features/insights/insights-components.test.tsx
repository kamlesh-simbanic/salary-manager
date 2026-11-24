import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Earner, GroupPayStats, PayStats } from '../../api/types'
import { EarnersTable } from './EarnersTable'
import { PayByGroupTable } from './PayByGroupTable'
import { SummaryCards } from './SummaryCards'

const stats: PayStats = {
  count: 9519,
  minUsdMinor: 1_090_000,
  medianUsdMinor: 6_844_100,
  meanUsdMinor: 7_543_000,
  maxUsdMinor: 21_890_000,
  totalUsdMinor: 71_800_000_000,
}

describe('SummaryCards', () => {
  it('shows headline numbers formatted in USD', () => {
    render(<SummaryCards stats={stats} />)
    expect(screen.getByText('9,519')).toBeInTheDocument()
    expect(screen.getByText('$68,441')).toBeInTheDocument()
    expect(screen.getByText('$10.9K – $218.9K')).toBeInTheDocument()
    expect(screen.getByText('$718M')).toBeInTheDocument()
  })

  it('renders placeholders while loading instead of fake numbers', () => {
    render(<SummaryCards />)
    expect(screen.queryByText('$0')).not.toBeInTheDocument()
    expect(screen.getByText('Median salary')).toBeInTheDocument()
  })
})

describe('PayByGroupTable', () => {
  const rows: GroupPayStats[] = [
    { ...stats, key: 'United States', count: 1215 },
    { ...stats, key: 'India', count: 1267, medianUsdMinor: 2_560_000 },
  ]

  it('lists one row per group with the exact median', () => {
    render(<PayByGroupTable rows={rows} label="Country" />)
    const table = screen.getByRole('table', { name: /pay by country/i })
    expect(within(table).getByText('United States')).toBeInTheDocument()
    expect(within(table).getByText('$25,600')).toBeInTheDocument()
  })
})

describe('EarnersTable', () => {
  const earner: Earner = {
    id: 1,
    firstName: 'Bell',
    lastName: 'Orn',
    jobTitle: 'Customer Support Agent',
    department: 'Support',
    country: 'India',
    currency: 'INR',
    salaryMinor: 90_275_700,
    salaryUsdMinor: 1_087_700,
  }

  it('shows USD and the local-currency amount for non-USD employees', () => {
    render(<EarnersTable earners={[earner]} label="Lowest earners" />)
    expect(screen.getByText('$10,877')).toBeInTheDocument()
    expect(screen.getByText('₹902,757')).toBeInTheDocument()
  })

  it('does not repeat the amount for USD employees', () => {
    render(<EarnersTable earners={[{ ...earner, currency: 'USD', salaryMinor: 1_087_700 }]} label="x" />)
    expect(screen.getAllByText('$10,877')).toHaveLength(1)
  })

  it('shows an empty state', () => {
    render(<EarnersTable earners={[]} label="x" />)
    expect(screen.getByText('No data.')).toBeInTheDocument()
  })
})
