import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, login } from '../api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup({ name, email, password })
      const { data } = await login({ email, password })
      setUser(data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-gradient"></div>
        <div className="auth-pattern"></div>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🎫</span>
          <h1>Create Account</h1>
          <p>Join us to start booking movies</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={5}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
