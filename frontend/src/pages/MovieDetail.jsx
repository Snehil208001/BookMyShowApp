import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getVenuesByMovie, getMovie } from '../api'
import { useAuth } from '../context/AuthContext'
import './MovieDetail.css'

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movie, setMovie] = useState(null)
  const [venues, setVenues] = useState([])
  const [posterError, setPosterError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [movieRes, venuesRes] = await Promise.all([
          getMovie(id),
          getVenuesByMovie(id),
        ])
        setMovie(movieRes.data.movie || null)
        setVenues(venuesRes.data.venues || [])
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSelectShowtime = (showtimeId) => {
    if (!user) {
      navigate('/login', { state: { from: `/showtime/${showtimeId}` } })
      return
    }
    navigate(`/showtime/${showtimeId}`)
  }

  if (loading) {
    return (
      <div className="movie-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading movie details...</p>
      </div>
    )
  }
  if (error) return <div className="error-state"><p>{error}</p></div>
  if (venues.length === 0) {
    return (
      <div className="empty-state-detail">
        <span className="empty-icon">🎬</span>
        <p>No showtimes available for this movie.</p>
        <Link to="/" className="back-link">← Back to movies</Link>
      </div>
    )
  }

  return (
    <div className="movie-detail">
      <Link to="/" className="back-link">
        <span className="back-arrow">←</span>
        Back to movies
      </Link>

      {movie && (
        <div className="movie-header">
          <div className="movie-poster-large">
            {movie.poster && !posterError ? (
              <img src={movie.poster} alt={movie.title} onError={() => setPosterError(true)} />
            ) : null}
            <div className={`poster-fallback ${!movie.poster || posterError ? 'show' : ''}`}>
              <span>🎬</span>
            </div>
            <div className="poster-glow"></div>
          </div>
          <div className="movie-meta">
            <span className="meta-badge">Now Showing</span>
            <h1>{movie.title}</h1>
            {movie.duration && (
              <p className="duration">
                <span className="duration-icon">⏱</span>
                {movie.duration}
              </p>
            )}
            {movie.desc && <p className="description">{movie.desc}</p>}
          </div>
        </div>
      )}

      <div className="venues-section">
        <h2>
          <span className="section-icon">📍</span>
          Select Venue & Showtime
        </h2>
        <div className="venues-list">
          {venues.map((venue) => (
            <div key={venue.id} className="venue-card">
              <div className="venue-info">
                <h3>{venue.name}</h3>
                <p className="location">
                  <span>📍</span> {venue.location}
                </p>
                {venue.movie_name && (
                  <p className="movie-name">{venue.movie_name}</p>
                )}
              </div>
              <div className="showtimes">
                {venue.show_times?.map((st) => (
                  <button
                    key={st.id}
                    className="showtime-btn"
                    onClick={() => handleSelectShowtime(st.id)}
                  >
                    {typeof st === 'string' ? st : st.timing}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
