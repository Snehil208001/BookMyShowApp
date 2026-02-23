import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Tilt from 'react-parallax-tilt'
import { ArrowLeft, Clock, MapPin, Film, AlertCircle } from 'lucide-react'
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
  if (error) return <div className="error-state"><AlertCircle size={48} /><p>{error}</p></div>
  if (venues.length === 0) {
    return (
      <div className="empty-state-detail">
        <Film className="empty-icon" size={48} style={{ margin: '0 auto 1rem' }} />
        <p>No showtimes available for this movie.</p>
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to movies</Link>
      </div>
    )
  }

  return (
    <div className="movie-detail">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} />
        Back to movies
      </Link>

      {movie && (
        <div className="movie-header">
          <Tilt
            className="tilt-wrapper"
            perspective={1000}
            glareEnable={true}
            glareMaxOpacity={0.4}
            glareColor="#ffffff"
            glarePosition="all"
            scale={1.05}
            transitionSpeed={1500}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
          >
            <div className="movie-poster-large">
              {movie.poster && !posterError ? (
                <img src={movie.poster} alt={movie.title} onError={() => setPosterError(true)} />
              ) : null}
              <div className={`poster-fallback ${!movie.poster || posterError ? 'show' : ''}`}>
                <Film size={64} color="var(--text-muted)" />
              </div>
              <div className="poster-glow"></div>
            </div>
          </Tilt>
          <div className="movie-meta">
            <span className="meta-badge">Now Showing</span>
            <h1>{movie.title}</h1>
            {movie.duration && (
              <p className="duration">
                <Clock className="duration-icon" size={16} />
                {movie.duration}
              </p>
            )}
            {movie.desc && <p className="description">{movie.desc}</p>}
          </div>
        </div>
      )}

      <div className="venues-section">
        <h2>
          <MapPin className="section-icon" color="var(--accent)" />
          Select Venue & Showtime
        </h2>
        <div className="venues-list">
          {venues.map((venue) => (
            <div key={venue.id} className="venue-card">
              <div className="venue-info">
                <h3>{venue.name}</h3>
                <p className="location">
                  <MapPin size={14} /> {venue.location}
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
