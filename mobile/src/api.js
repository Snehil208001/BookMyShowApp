import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE } from './config'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Movies
export const getMovies = (params) => api.get('/movies/', { params })
export const getMovie = (id) => api.get(`/movies/${id}`)
export const getVenuesByMovie = (id) => api.get(`/movies/venues/${id}`)

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
