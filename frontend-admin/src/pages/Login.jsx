import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../api'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  useEffect(() => {
    if (user?.isAdmin) navigate(from, { replace: true })
  }, [user, from, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login({ email, password })
      if (!data.user?.isAdmin) {
        setError('Admin access required. Please use admin credentials.')
        setLoading(false)
        return
      }
      setUser(data.user)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed'
      setError(err.code === 'ERR_NETWORK' ? 'Cannot connect to server. Is the backend running on port 8080?' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">⚙️</span>
          <h1>BookMyShow Admin</h1>
          <p>Sign in to manage movies and venues</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="login-hint">Use admin@example.com / admin123</p>
      </div>
    </div>
  )
}
