import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EmployeeFilters, type FilterValues } from './EmployeeFilters'

const empty: FilterValues = { search: '', country: '', department: '', jobTitle: '', status: '' }

describe('EmployeeFilters', () => {
  it('hides "Clear filters" when no filter is active', () => {
    render(<EmployeeFilters values={empty} onChange={() => {}} onClear={() => {}} />)
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument()
  })

  it('shows "Clear filters" and calls onClear when a filter is active', () => {
    const onClear = vi.fn()
    render(<EmployeeFilters values={{ ...empty, country: 'India' }} onChange={() => {}} onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(onClear).toHaveBeenCalled()
  })

  it('reports typed search text', () => {
    const onChange = vi.fn()
    render(<EmployeeFilters values={empty} onChange={onChange} onClear={() => {}} />)
    fireEvent.change(screen.getByLabelText(/search name or email/i), { target: { value: 'asha' } })
    expect(onChange).toHaveBeenCalledWith({ search: 'asha' })
  })
})
