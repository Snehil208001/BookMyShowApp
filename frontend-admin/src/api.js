import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:8080')

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Auth
export const login = (data) => api.post('/user/login', data)
export const getMe = () => api.get('/user/me')
export const logout = () => api.post('/user/logout')

// Movies
export const getMovies = (params) => api.get('/movies/', { params })
export const getMovie = (id) => api.get(`/movies/${id}`)
export const createMovie = (data) => api.post('/movies/', data)
export const updateMoviePoster = (movieId, posterUrl) => api.patch(`/movies/${movieId}/poster`, { poster: posterUrl })
export const uploadMoviePoster = (movieId, file) => {
  const form = new FormData()
  form.append('poster', file)
  return api.post(`/movies/upload/poster/${movieId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

// Venues
export const getVenues = (params) => api.get('/venues/', { params })
export const getVenue = (id) => api.get(`/venues/${id}`)
export const createVenue = (data) => api.post('/venues/', data)
export const addMoviesToVenue = (venueId, movieIds) => api.post(`/venues/${venueId}/movies/add`, { movie_ids: movieIds })
export const addShowTimings = (venueId, movieId, showTimings) => api.post(`/venues/${venueId}/timings/add`, { movie_id: movieId, show_timings: showTimings })
