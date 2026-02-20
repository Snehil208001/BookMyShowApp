import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
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
          <span className="logo-icon">🎬</span>
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
            <span className="nav-icon">🎬</span>
            Movies
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                <span className="nav-icon">🎫</span>
                My Orders
              </Link>
              <div className="user-section">
                <span className="user-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                <span className="user-badge">{user.name}</span>
              </div>
              <button type="button" className="nav-logout" onClick={handleLogout}>
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
            <span className="footer-logo">🎬</span>
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
