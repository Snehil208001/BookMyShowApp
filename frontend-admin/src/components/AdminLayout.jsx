import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api'
import './AdminLayout.css'

export default function AdminLayout() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      navigate('/login')
    } catch (err) {
      setUser(null)
      navigate('/login')
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-logo">⚙️</span>
          <h2>BookMyShow Admin</h2>
        </div>
        <nav className="admin-nav">
          <NavLink to="/" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/movies" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Movies
          </NavLink>
          <NavLink to="/venues" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Venues
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-user">{user?.name}</span>
          <a href={import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:5173'} target="_blank" rel="noopener noreferrer" className="admin-back">
            Open Main Site →
          </a>
          <button type="button" className="admin-logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
