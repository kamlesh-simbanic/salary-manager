import { Navigate, Route, Routes } from 'react-router-dom'
import { EmployeesPage } from './features/employees/EmployeesPage'
import { InsightsPage } from './features/insights/InsightsPage'
import { AppLayout } from './layout/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Route>
    </Routes>
  )
}
