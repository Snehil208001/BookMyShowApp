import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'
import SeatSelection from './pages/SeatSelection'
import BookingSuccess from './pages/BookingSuccess'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Orders from './pages/Orders'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="movie/:id" element={<MovieDetail />} />
          <Route path="showtime/:id" element={<SeatSelection />} />
          <Route path="booking-success" element={<BookingSuccess />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
