import { useState, useEffect } from 'react'
import { getVenues, getVenue, getMovies, createVenue, addMoviesToVenue, addShowTimings } from '../api'
import './Admin.css'

export default function Venues() {
  const [venues, setVenues] = useState([])
  const [venueDetails, setVenueDetails] = useState({})
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [venueForm, setVenueForm] = useState({ name: '', location: '' })
  const [showTimingForm, setShowTimingForm] = useState(null)
  const [timingForm, setTimingForm] = useState({ movieId: '', timings: '' })
  const [addMoviesForm, setAddMoviesForm] = useState(null)
  const [selectedMovieIds, setSelectedMovieIds] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const [venuesRes, moviesRes] = await Promise.all([
        getVenues({ limit: 50, offset: 0 }),
        getMovies({ limit: 100, offset: 0 }),
      ])
      setVenues(venuesRes.data.venues || [])
      setMovies(moviesRes.data.movies || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const loadVenueDetails = async (venueId) => {
    try {
      const { data } = await getVenue(venueId)
      setVenueDetails((prev) => ({ ...prev, [venueId]: data.venue }))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const clearMessages = () => {
    setTimeout(() => { setSuccess(null); setError(null) }, 3000)
  }

  const handleCreateVenue = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createVenue(venueForm)
      setVenueForm({ name: '', location: '' })
      setShowForm(false)
      setSuccess('Venue created!')
      load()
      clearMessages()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create venue')
      clearMessages()
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddMovies = async (e) => {
    e.preventDefault()
    if (!addMoviesForm || selectedMovieIds.length === 0) return
    setError(null)
    setSubmitting(true)
    try {
      await addMoviesToVenue(addMoviesForm.id ?? addMoviesForm.ID, selectedMovieIds)
      setAddMoviesForm(null)
      setSelectedMovieIds([])
      setSuccess('Movies added to venue!')
      load()
      loadVenueDetails(addMoviesForm.id ?? addMoviesForm.ID)
      clearMessages()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add movies')
      clearMessages()
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddShowTimings = async (e) => {
    e.preventDefault()
    if (!showTimingForm) return
    setError(null)
    setSubmitting(true)
    try {
      const timings = timingForm.timings.split(',').map((s) => s.trim()).filter(Boolean)
      await addShowTimings(showTimingForm.id ?? showTimingForm.ID, parseInt(timingForm.movieId, 10), timings)
      setShowTimingForm(null)
      setTimingForm({ movieId: '', timings: '' })
      setSuccess('Showtimes added!')
      load()
      loadVenueDetails(showTimingForm.id ?? showTimingForm.ID)
      clearMessages()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add showtimes')
      clearMessages()
    } finally {
      setSubmitting(false)
    }
  }

  const toggleMovieSelection = (id) => {
    setSelectedMovieIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  if (loading) return <div className="admin-loading">Loading...</div>

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Venues</h1>
        <button type="button" className="admin-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Venue'}
        </button>
      </div>
      {success && <p className="admin-success">{success}</p>}
      {error && <p className="admin-error">{error}</p>}
      {showForm && (
        <form className="admin-form" onSubmit={handleCreateVenue}>
          <input
            placeholder="Venue Name"
            value={venueForm.name}
            onChange={(e) => setVenueForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            placeholder="Location"
            value={venueForm.location}
            onChange={(e) => setVenueForm((f) => ({ ...f, location: e.target.value }))}
            required
          />
          <button type="submit" className="admin-btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Venue'}
          </button>
        </form>
      )}
      <div className="admin-venues-list">
        {venues.length === 0 ? (
          <p className="admin-empty">No venues yet. Add one above.</p>
        ) : (
          venues.map((venue) => {
            const vid = venue.id ?? venue.ID
            const details = venueDetails[vid]
            const showAddMovies = addMoviesForm && (addMoviesForm.id ?? addMoviesForm.ID) === vid
            const showAddTimings = showTimingForm && (showTimingForm.id ?? showTimingForm.ID) === vid
            return (
              <div key={vid} className="admin-venue-card">
                <div className="admin-venue-info">
                  <h3>{venue.name}</h3>
                  <p>{venue.location}</p>
                  {details && (
                    <div className="admin-venue-meta">
                      <span>Movies: {details.movies?.length ?? 0}</span>
                      <span>Showtimes: {details.show_times?.length ?? 0}</span>
                      {details.show_times?.length > 0 && (
                        <div className="admin-showtimes-list">
                          {details.show_times.slice(0, 6).map((st) => (
                            <span key={st.ID ?? st.id} className="admin-showtime-tag">
                              {st.movie?.title?.slice(0, 15)} @ {st.timing}
                            </span>
                          ))}
                          {(details.show_times?.length ?? 0) > 6 && <span>...</span>}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-link"
                    onClick={() => loadVenueDetails(vid)}
                  >
                    {details ? 'Refresh' : 'Load details'}
                  </button>
                </div>
                <div className="admin-venue-actions">
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={() => { setAddMoviesForm(showAddMovies ? null : venue); setSelectedMovieIds([]); }}
                  >
                    Add Movies
                  </button>
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={() => setShowTimingForm(showAddTimings ? null : venue)}
                  >
                    Add Showtimes
                  </button>
                </div>
                {showAddMovies && (
                  <form className="admin-inline-form admin-movie-select" onSubmit={handleAddMovies}>
                    <div className="admin-movie-checkboxes">
                      {movies.map((m) => (
                        <label key={m.ID ?? m.id} className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedMovieIds.includes(m.ID ?? m.id)}
                            onChange={() => toggleMovieSelection(m.ID ?? m.id)}
                          />
                          {m.title} (ID: {m.ID ?? m.id})
                        </label>
                      ))}
                    </div>
                    <button type="submit" disabled={submitting || selectedMovieIds.length === 0}>Add ({selectedMovieIds.length})</button>
                    <button type="button" className="admin-btn-sm" onClick={() => setAddMoviesForm(null)}>Cancel</button>
                  </form>
                )}
                {showAddTimings && (
                  <form className="admin-inline-form" onSubmit={handleAddShowTimings}>
                    <select
                      value={timingForm.movieId}
                      onChange={(e) => setTimingForm((f) => ({ ...f, movieId: e.target.value }))}
                      required
                    >
                      <option value="">Select Movie</option>
                      {movies.map((m) => (
                        <option key={m.ID ?? m.id} value={m.ID ?? m.id}>{m.title}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Showtimes (e.g. 10:00,14:00,18:00)"
                      value={timingForm.timings}
                      onChange={(e) => setTimingForm((f) => ({ ...f, timings: e.target.value }))}
                      required
                    />
                    <button type="submit" disabled={submitting}>Add</button>
                    <button type="button" className="admin-btn-sm" onClick={() => setShowTimingForm(null)}>Cancel</button>
                  </form>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
