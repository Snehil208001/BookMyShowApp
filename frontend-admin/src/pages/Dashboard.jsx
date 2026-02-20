import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMovies, getVenues } from '../api'
import './Admin.css'

export default function Dashboard() {
  const [moviesCount, setMoviesCount] = useState(0)
  const [venuesCount, setVenuesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [moviesRes, venuesRes] = await Promise.all([
          getMovies({ limit: 100, offset: 0 }),
          getVenues({ limit: 100, offset: 0 }),
        ])
        setMoviesCount(moviesRes.data.total_movies ?? moviesRes.data.movies?.length ?? 0)
        setVenuesCount(venuesRes.data.venues?.length ?? 0)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="admin-loading">Loading...</div>

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      <p className="admin-subtitle">Manage your movie booking platform</p>
      <div className="admin-quick-tips">
        <p>• Add movies with poster URLs from TMDB or other CDNs</p>
        <p>• Link movies to venues, then add showtimes</p>
        <p>• Use "Edit Poster" to update movie poster URLs</p>
      </div>
      <div className="admin-stats">
        <Link to="/movies" className="admin-stat-card">
          <span className="admin-stat-value">{moviesCount}</span>
          <span className="admin-stat-label">Movies</span>
        </Link>
        <Link to="/venues" className="admin-stat-card">
          <span className="admin-stat-value">{venuesCount}</span>
          <span className="admin-stat-label">Venues</span>
        </Link>
      </div>
      <div className="admin-actions">
        <Link to="/movies" className="admin-action-btn">Add Movies</Link>
        <Link to="/venues" className="admin-action-btn">Manage Venues</Link>
      </div>
    </div>
  )
}
