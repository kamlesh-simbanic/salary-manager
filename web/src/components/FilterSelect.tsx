import { MenuItem, TextField } from '@mui/material'

interface Props {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  allLabel?: string
}

/** Small "All / option…" dropdown shared by the employee and insights filters. */
export function FilterSelect({ label, value, options, onChange, allLabel = 'All' }: Props) {
  return (
    <TextField select size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 170 }}>
      <MenuItem value="">{allLabel}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  )
}
