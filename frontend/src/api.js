import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:8080')

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Movies
export const getMovies = (params) => api.get('/movies/', { params })
export const getMovie = (id) => api.get(`/movies/${id}`)
export const getVenuesByMovie = (id) => api.get(`/movies/venues/${id}`)

// Venues
export const getVenues = (params) => api.get('/venues/', { params })
export const getVenue = (id) => api.get(`/venues/${id}`)

// Seats
export const getSeatLayout = (showtimeId) => api.get(`/seats/showtime/${showtimeId}`)
export const reserveSeats = (showId, seatIds) => api.post('/seats/showtime/reserve', { show_id: showId, seat_ids: seatIds })
export const bookSeats = (showId, seatIds) => api.post('/seats/showtime/book', { show_id: showId, seat_ids: seatIds })

// Auth
export const signup = (data) => api.post('/user/signup', data)
export const login = (data) => api.post('/user/login', data)
export const getMe = () => api.get('/user/me')
export const logout = () => api.post('/user/logout')

// Orders
export const getOrders = () => api.get('/orders/')
