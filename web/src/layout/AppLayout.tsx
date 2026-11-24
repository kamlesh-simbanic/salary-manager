import PaymentsIcon from '@mui/icons-material/Payments'
import { AppBar, Button, Container, Toolbar, Typography } from '@mui/material'
import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/employees', label: 'Employees' },
  { to: '/insights', label: 'Insights' },
]

export function AppLayout() {
  return (
    <>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <PaymentsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 4 }}>
            Salary Manager
          </Typography>
          {NAV.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              color="inherit"
              sx={{ '&.active': { color: 'primary.main', fontWeight: 700 } }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  )
}
