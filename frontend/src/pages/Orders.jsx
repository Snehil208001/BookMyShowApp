import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../api'
import { useAuth } from '../context/AuthContext'
import './Orders.css'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getOrders()
        setOrders(data.orders || [])
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  if (!user) {
    return (
      <div className="auth-required">
        <div className="auth-required-card">
          <span className="auth-required-icon">🎫</span>
          <p>Please log in to view your orders.</p>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <span className="orders-count">{orders.length} booking{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">🎭</div>
          <p>No bookings yet</p>
          <span>Start exploring and book your first movie!</span>
          <Link to="/" className="btn-browse">Browse Movies</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-price">₹{order.total_price}</span>
              </div>
              <div className="order-card-body">
                {order.movie_name && (
                  <div className="order-meta">
                    <span className="order-movie">{order.movie_name}</span>
                    {order.venue_name && (
                      <span className="order-venue">
                        <span className="meta-dot">•</span>
                        {order.venue_name}
                      </span>
                    )}
                    {order.showtime && (
                      <span className="order-showtime">
                        <span className="meta-dot">•</span>
                        {order.showtime}
                      </span>
                    )}
                  </div>
                )}
                <div className="order-seats">
                  <span className="seats-label">Seats:</span>
                  {order.seats?.join(', ') || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
