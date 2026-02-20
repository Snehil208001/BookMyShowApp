import { Link, useLocation, Navigate } from 'react-router-dom'
import './BookingSuccess.css'

export default function BookingSuccess() {
  const { state } = useLocation()
  if (!state?.movieName && !state?.seats?.length) {
    return <Navigate to="/" replace />
  }
  const movieName = state?.movieName || 'Movie'
  const venueName = state?.venueName || ''
  const showtime = state?.showtime || ''
  const seats = state?.seats || []
  const total = state?.total || 0

  return (
    <div className="booking-success">
      <div className="success-card">
        <div className="success-icon-wrap">
          <div className="success-icon">✓</div>
          <div className="success-ring"></div>
        </div>
        <h1>Booking Confirmed!</h1>
        <p className="subtitle">Your tickets have been booked successfully</p>

        <div className="ticket-card">
          <div className="ticket-header">
            <span className="ticket-label">E-Ticket</span>
            <span className="ticket-barcode">||||||||||||||||</span>
          </div>
          <div className="ticket-body">
            <div className="ticket-row">
              <span className="ticket-field">Movie</span>
              <span className="ticket-value">{movieName}</span>
            </div>
            {venueName && (
              <div className="ticket-row">
                <span className="ticket-field">Venue</span>
                <span className="ticket-value">{venueName}</span>
              </div>
            )}
            {showtime && (
              <div className="ticket-row">
                <span className="ticket-field">Showtime</span>
                <span className="ticket-value">{showtime}</span>
              </div>
            )}
            {seats.length > 0 && (
              <div className="ticket-row">
                <span className="ticket-field">Seats</span>
                <span className="ticket-value seats">{seats.join(', ')}</span>
              </div>
            )}
            <div className="ticket-row total-row">
              <span className="ticket-field">Total</span>
              <span className="ticket-value price">₹{total}</span>
            </div>
          </div>
        </div>

        <div className="actions">
          <Link to="/orders" className="btn-primary">View My Orders</Link>
          <Link to="/" className="btn-secondary">Browse More Movies</Link>
        </div>
      </div>
    </div>
  )
}
