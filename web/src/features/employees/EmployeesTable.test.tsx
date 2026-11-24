import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Employee } from '../../api/types'
import { EmployeesTable } from './EmployeesTable'

const employee: Employee = {
  id: 1,
  firstName: 'Asha',
  lastName: 'Rao',
  email: 'asha.rao@acme.example',
  jobTitle: 'Software Engineer',
  department: 'Engineering',
  country: 'India',
  currency: 'INR',
  salaryMinor: 1_500_000_00,
  hireDate: '2022-04-01',
  status: 'active',
}

const baseProps = { sortBy: 'lastName' as const, sortDir: 'asc' as const, onSortChange: () => {} }

describe('EmployeesTable', () => {
  it('renders a row with formatted salary, date and status', () => {
    render(<EmployeesTable {...baseProps} employees={[employee]} />)
    expect(screen.getByText('Asha Rao')).toBeInTheDocument()
    expect(screen.getByText(/₹1,500,000/)).toBeInTheDocument()
    expect(screen.getByText('Apr 1, 2022')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', () => {
    render(<EmployeesTable {...baseProps} employees={[]} />)
    expect(screen.getByText(/no employees match/i)).toBeInTheDocument()
  })

  it('shows skeletons instead of rows while loading', () => {
    render(<EmployeesTable {...baseProps} employees={[employee]} loading />)
    expect(screen.queryByText('Asha Rao')).not.toBeInTheDocument()
  })

  it('reports the sort key when a sortable header is clicked', () => {
    const onSortChange = vi.fn()
    render(<EmployeesTable {...baseProps} employees={[employee]} onSortChange={onSortChange} />)
    fireEvent.click(screen.getByRole('button', { name: /salary/i }))
    expect(onSortChange).toHaveBeenCalledWith('salary')
  })

  it('does not make non-sortable columns clickable', () => {
    render(<EmployeesTable {...baseProps} employees={[employee]} />)
    expect(screen.queryByRole('button', { name: /department/i })).not.toBeInTheDocument()
  })
})
