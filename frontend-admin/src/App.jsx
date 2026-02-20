import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Movies from './pages/Movies'
import Venues from './pages/Venues'
import AdminLayout from './components/AdminLayout'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/Login" element={<Navigate to="/login" replace />} />
      <Route path="/" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="movies" element={<Movies />} />
        <Route path="venues" element={<Venues />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
