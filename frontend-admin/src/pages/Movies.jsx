import { useState, useEffect } from 'react'
import { getMovies, createMovie, updateMoviePoster } from '../api'
import './Admin.css'

export default function Movies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', desc: '', duration: '', poster: '' })
  const [editingPoster, setEditingPoster] = useState(null)
  const [editPosterUrl, setEditPosterUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadMovies = async () => {
    try {
      const { data } = await getMovies({ limit: 100, offset: 0 })
      setMovies(data.movies || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMovies()
  }, [])

  const clearMessages = () => {
    setTimeout(() => { setSuccess(null); setError(null) }, 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      await createMovie({
        title: form.title,
        desc: form.desc,
        duration: form.duration,
        poster: form.poster || undefined,
      })
      setForm({ title: '', desc: '', duration: '', poster: '' })
      setShowForm(false)
      setSuccess('Movie created successfully!')
      loadMovies()
      clearMessages()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors || 'Failed to create movie')
      clearMessages()
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdatePoster = async (e) => {
    e.preventDefault()
    if (!editingPoster) return
    setError(null)
    setSubmitting(true)
    try {
      await updateMoviePoster(editingPoster.ID ?? editingPoster.id, editPosterUrl)
      setEditingPoster(null)
      setEditPosterUrl('')
      setSuccess('Poster updated!')
      loadMovies()
      clearMessages()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update poster')
      clearMessages()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="admin-loading">Loading movies...</div>

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Movies</h1>
        <button type="button" className="admin-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Movie'}
        </button>
      </div>
      {success && <p className="admin-success">{success}</p>}
      {error && <p className="admin-error">{error}</p>}
      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <textarea
            placeholder="Description"
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            required
            rows={3}
          />
          <input
            placeholder="Duration (e.g. 2h 28m)"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            required
          />
          <input
            placeholder="Poster URL (optional)"
            value={form.poster}
            onChange={(e) => setForm((f) => ({ ...f, poster: e.target.value }))}
          />
          <button type="submit" className="admin-btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Movie'}
          </button>
        </form>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Poster</th>
              <th>Title</th>
              <th>Duration</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.length === 0 ? (
              <tr><td colSpan={6} className="admin-empty">No movies yet. Add one above.</td></tr>
            ) : (
              movies.map((m) => (
                <tr key={m.ID ?? m.id}>
                  <td>{m.ID ?? m.id}</td>
                  <td>
                    {m.poster ? (
                      <img src={m.poster} alt="" className="admin-poster-thumb" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span className="admin-no-poster">—</span>
                    )}
                  </td>
                  <td>{m.title}</td>
                  <td>{m.duration}</td>
                  <td className="admin-desc-cell">{(m.desc || m.description || '').slice(0, 50)}...</td>
                  <td>
                    {editingPoster && (editingPoster.ID ?? editingPoster.id) === (m.ID ?? m.id) ? (
                      <form className="admin-inline-form" onSubmit={handleUpdatePoster}>
                        <input
                          placeholder="Poster URL"
                          value={editPosterUrl}
                          onChange={(e) => setEditPosterUrl(e.target.value)}
                          size={20}
                        />
                        <button type="submit" disabled={submitting}>Save</button>
                        <button type="button" className="admin-btn-sm" onClick={() => { setEditingPoster(null); setEditPosterUrl(''); }}>Cancel</button>
                      </form>
                    ) : (
                      <button type="button" className="admin-btn-sm" onClick={() => { setEditingPoster(m); setEditPosterUrl(m.poster || ''); }}>
                        Edit Poster
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
