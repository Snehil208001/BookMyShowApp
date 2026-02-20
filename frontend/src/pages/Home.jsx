import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMovies } from '../api'
import './Home.css'

function MovieCardSkeleton() {
  return (
    <div className="movie-card skeleton-card">
      <div className="movie-poster skeleton skeleton-poster"></div>
      <div className="movie-info">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-duration"></div>
      </div>
    </div>
  )
}

function MovieCard({ movie, index }) {
  const [imgError, setImgError] = useState(false)
  const showPoster = movie.poster && !imgError

  return (
    <Link
      to={`/movie/${movie.ID ?? movie.id}`}
      className="movie-card"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="movie-poster">
        {showPoster ? (
          <img src={movie.poster} alt={movie.title} onError={() => setImgError(true)} />
        ) : null}
        <div className={`poster-placeholder ${!showPoster ? 'show' : ''}`}>
          <span className="placeholder-icon">🎬</span>
        </div>
        <div className="movie-overlay">
          <span className="view-details">View Details</span>
        </div>
        {movie.duration && (
          <span className="duration-badge">{movie.duration}</span>
        )}
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="duration">{movie.duration}</p>
      </div>
    </Link>
  )
}

export default function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')

  const loadMovies = async (reset = false, searchTerm = '') => {
    try {
      setLoading(true)
      const off = reset ? 0 : offset
      const { data } = await getMovies({ limit: 12, offset: off, name: searchTerm || undefined })
      setMovies(reset ? data.movies : (prev) => [...prev, ...(data.movies || [])])
      setOffset(off + (data.movies?.length || 0))
      setHasMore(data.next_offset !== -1)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMovies(true, search)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setOffset(0)
    loadMovies(true, search)
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <p className="hint">Make sure the backend is running at http://localhost:8080</p>
      </div>
    )
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <span className="hero-badge">Now in Theaters</span>
          <h1>Discover Your Next <span className="highlight">Movie</span> Experience</h1>
          <p>Browse the latest blockbusters and book your tickets in seconds</p>
          <form onSubmit={handleSearch} className="search-form">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
        </div>
      </section>

      <section className="movies-section">
        <div className="section-header">
          <h2>Now Showing</h2>
          <span className="movie-count">{movies.length} movies</span>
        </div>

        <div className="movies-grid">
          {loading && movies.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
          ) : (
            movies.map((movie, i) => (
              <MovieCard key={movie.ID ?? movie.id} movie={movie} index={i} />
            ))
          )}
        </div>

        {loading && movies.length > 0 && (
          <div className="loading-more">
            <div className="loading-spinner"></div>
            <span>Loading more...</span>
          </div>
        )}
        {hasMore && !loading && movies.length > 0 && (
          <button className="load-more" onClick={() => loadMovies(false, search)}>
            Load More Movies
          </button>
        )}
        {!loading && movies.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <p>No movies found</p>
            <span>Add some via the admin panel to get started</span>
          </div>
        )}
      </section>
    </div>
  )
}
