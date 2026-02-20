import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSeatLayout, reserveSeats, bookSeats } from '../api'
import { useAuth } from '../context/AuthContext'
import './SeatSelection.css'

export default function SeatSelection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [layout, setLayout] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [step, setStep] = useState('select')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadLayout = async () => {
    try {
      const { data } = await getSeatLayout(id)
      setLayout(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load seats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/showtime/${id}` } })
      return
    }
    loadLayout()
  }, [id, user, navigate])

  const toggleSeat = (seat) => {
    if (seat.is_booked) return
    if (step === 'select' && (seat.is_reserved || !seat.is_available)) return
    if (step === 'reserved' && !seat.is_reserved) return

    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seat_number === seat.seat_number)
      if (exists) return prev.filter((s) => s.seat_number !== seat.seat_number)
      return [...prev, { ...seat, id: seat.id }]
    })
  }

  const handleReserve = async () => {
    if (selectedSeats.length === 0) return
    setActionLoading(true)
    setError(null)
    try {
      const seatIds = selectedSeats.map((s) => s.id)
      await reserveSeats(parseInt(id), seatIds)
      setStep('reserved')
      const { data } = await getSeatLayout(id)
      setLayout(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reserve seats')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBook = async () => {
    if (selectedSeats.length === 0) return
    setActionLoading(true)
    setError(null)
    try {
      const seatIds = selectedSeats.map((s) => s.id)
      await bookSeats(parseInt(id), seatIds)
      navigate('/booking-success', {
        state: {
          movieName: layout?.movie_name,
          venueName: layout?.venue_name,
          showtime: layout?.showtime,
          seats: selectedSeats.map((s) => s.seat_number),
          total: totalPrice,
        },
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book seats')
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="seat-selection seat-selection-loading">
        <div className="loading-spinner"></div>
        <p>Loading seat layout...</p>
      </div>
    )
  }
  if (error && !layout) {
    return (
      <div className="seat-selection seat-selection-error">
        <p>{error}</p>
        <button type="button" className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    )
  }

  const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)
  const seats = layout?.seats || {}

  return (
    <div className="seat-selection">
      <header className="seat-selection-header">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="seat-selection-title">
          <h1>Select Your Seats</h1>
          <div className="showtime-meta">
            <span className="meta-movie">{layout?.movie_name}</span>
            <span className="meta-divider">•</span>
            <span>{layout?.venue_name}</span>
            <span className="meta-divider">•</span>
            <span className="meta-time">{layout?.showtime}</span>
          </div>
        </div>
      </header>

      <div className="theater-layout">
        <div className="screen-area">
          <div className="screen-curve"></div>
          <span className="screen-label">SCREEN THIS WAY</span>
        </div>

        <div className="legend-bar">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot selected"></span>
            <span>Your selection</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot reserved"></span>
            <span>Reserved</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot booked"></span>
            <span>Booked</span>
          </div>
        </div>

        <div className="seats-grid">
          {Object.entries(seats).map(([row, rowSeats]) => (
            <div key={row} className="seat-row">
              <span className="row-letter">{row}</span>
              <div className="row-seats">
                {rowSeats.map((seat, idx) => {
                  const isSelected = selectedSeats.some((s) => s.seat_number === seat.seat_number)
                  const canSelect = step === 'select' ? seat.is_available : seat.is_reserved
                  const seatNum = seat.seat_number?.replace(row, '') || ''
                  const showAisle = idx === 4 && rowSeats.length === 10
                  return (
                    <span key={seat.seat_number} className="seat-wrapper">
                      {showAisle && <span className="aisle-gap" />}
                      <button
                        type="button"
                        className={`seat ${seat.is_booked ? 'booked' : ''} ${seat.is_reserved && !seat.is_booked ? 'reserved' : ''} ${seat.is_available ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
                        disabled={!canSelect && !isSelected}
                        onClick={() => toggleSeat(seat)}
                        title={seat.seat_number}
                      >
                        {seatNum}
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="seat-error-banner">{error}</div>}

      <footer className="booking-footer">
        <div className="booking-summary">
          <div className="summary-details">
            <div className="summary-seats">
              <span className="summary-label">Seats</span>
              <span className="summary-value">
                {selectedSeats.length > 0
                  ? selectedSeats.map((s) => s.seat_number).join(', ')
                  : '—'}
              </span>
            </div>
            <div className="summary-total">
              <span className="summary-label">Total</span>
              <span className="summary-value price">₹{totalPrice}</span>
            </div>
          </div>
          <div className="summary-actions">
            {step === 'select' ? (
              <button
                type="button"
                className="btn-book"
                onClick={handleReserve}
                disabled={selectedSeats.length === 0 || actionLoading}
              >
                {actionLoading ? 'Reserving...' : `Reserve for 10 min (₹${totalPrice})`}
              </button>
            ) : (
              <button
                type="button"
                className="btn-book"
                onClick={handleBook}
                disabled={selectedSeats.length === 0 || actionLoading}
              >
                {actionLoading ? 'Booking...' : `Pay ₹${totalPrice} & Confirm`}
              </button>
            )}
          </div>
          {step === 'reserved' && (
            <p className="reserve-note">Your seats are reserved. Complete payment within 10 minutes.</p>
          )}
        </div>
      </footer>
    </div>
  )
}
