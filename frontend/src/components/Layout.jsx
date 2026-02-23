import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Clapperboard, Ticket, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api'
import './Layout.css'

export default function Layout() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      // Clear user even if API fails
    }
    setUser(null)
    setMobileMenuOpen(false)
    navigate('/')
  }

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
          <Clapperboard className="logo-icon" size={28} color="var(--accent)" />
          <span className="logo-text">BookMyShow</span>
        </Link>

        <button
          type="button"
          className="mobile-menu-btn"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={mobileMenuOpen ? 'open' : ''}></span>
          <span className={mobileMenuOpen ? 'open' : ''}></span>
          <span className={mobileMenuOpen ? 'open' : ''}></span>
        </button>

        <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            <Clapperboard className="nav-icon" />
            Movies
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                <Ticket className="nav-icon" />
                My Orders
              </Link>
              <div className="user-section">
                <span className="user-avatar">
                  <User size={20} />
                </span>
                <span className="user-badge">{user.name}</span>
              </div>
              <button type="button" className="nav-logout" onClick={handleLogout}>
                <LogOut size={16} style={{ marginRight: '6px' }} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="btn-signup" onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Clapperboard className="footer-logo" size={24} color="var(--accent)" />
            <span>BookMyShow</span>
          </div>
          <div className="footer-links">
            <Link to="/">Movies</Link>
            <Link to="/orders">My Orders</Link>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} BookMyShow — Your Movie Experience</p>
        </div>
      </footer>
    </div>
  )
}
