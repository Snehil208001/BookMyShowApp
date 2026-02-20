import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { getSeatLayout, reserveSeats, bookSeats } from '../api'
import { useAuth } from '../context/AuthContext'

export default function SeatSelectionScreen({ route, navigation }) {
  const { showtimeId } = route.params
  const { user } = useAuth()
  const [layout, setLayout] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [step, setStep] = useState('select')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      navigation.replace('Login', { from: 'SeatSelection', showtimeId })
      return
    }
    loadLayout()
  }, [showtimeId, user])

  const loadLayout = async () => {
    try {
      const { data } = await getSeatLayout(showtimeId)
      setLayout(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load seats')
    } finally {
      setLoading(false)
    }
  }

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
      await reserveSeats(parseInt(showtimeId, 10), seatIds)
      setStep('reserved')
      const { data } = await getSeatLayout(showtimeId)
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
      await bookSeats(parseInt(showtimeId, 10), seatIds)
      const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)
      navigation.replace('BookingSuccess', {
        movieName: layout?.movie_name,
        venueName: layout?.venue_name,
        showtime: layout?.showtime,
        seats: selectedSeats.map((s) => s.seat_number),
        total: totalPrice,
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book seats')
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading seats...</Text>
      </View>
    )
  }
  if (error && !layout) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)
  const seats = layout?.seats || {}

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
        <Text style={styles.backLinkText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Select Your Seats</Text>
      <Text style={styles.meta}>
        {layout?.movie_name} • {layout?.venue_name} • {layout?.showtime}
      </Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.screenArea}>
          <View style={styles.screenCurve} />
          <Text style={styles.screenLabel}>SCREEN THIS WAY</Text>
        </View>
        <View style={styles.legend}>
          <View style={[styles.legendDot, styles.available]} />
          <Text style={styles.legendText}>Available</Text>
          <View style={[styles.legendDot, styles.selected]} />
          <Text style={styles.legendText}>Selected</Text>
          <View style={[styles.legendDot, styles.reserved]} />
          <Text style={styles.legendText}>Reserved</Text>
          <View style={[styles.legendDot, styles.booked]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        {Object.entries(seats).map(([row, rowSeats]) => (
          <View key={row} style={styles.seatRow}>
            <Text style={styles.rowLetter}>{row}</Text>
            <View style={styles.rowSeats}>
              {rowSeats.map((seat, idx) => {
                const isSelected = selectedSeats.some((s) => s.seat_number === seat.seat_number)
                const canSelect = step === 'select' ? seat.is_available : seat.is_reserved
                const seatNum = seat.seat_number?.replace(row, '') || ''
                const showAisle = idx === 4 && rowSeats.length === 10
                return (
                  <View key={seat.seat_number} style={styles.seatWrapper}>
                    {showAisle && <View style={styles.aisleGap} />}
                    <TouchableOpacity
                      style={[
                        styles.seat,
                        seat.is_booked && styles.seatBooked,
                        seat.is_reserved && !seat.is_booked && styles.seatReserved,
                        seat.is_available && styles.seatAvailable,
                        isSelected && styles.seatSelected,
                      ]}
                      onPress={() => toggleSeat(seat)}
                      disabled={!canSelect && !isSelected}
                    >
                      <Text
                        style={[
                          styles.seatText,
                          (seat.is_booked || (seat.is_reserved && !isSelected)) && styles.seatTextMuted,
                        ]}
                      >
                        {seatNum}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <View style={styles.footer}>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Seats</Text>
          <Text style={styles.summaryValue}>
            {selectedSeats.length > 0 ? selectedSeats.map((s) => s.seat_number).join(', ') : '—'}
          </Text>
        </View>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryPrice}>₹{totalPrice}</Text>
        </View>
        {step === 'select' ? (
          <TouchableOpacity
            style={[styles.bookBtn, (selectedSeats.length === 0 || actionLoading) && styles.bookBtnDisabled]}
            onPress={handleReserve}
            disabled={selectedSeats.length === 0 || actionLoading}
          >
            <Text style={styles.bookBtnText}>
              {actionLoading ? 'Reserving...' : `Reserve for 10 min (₹${totalPrice})`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.bookBtn, (selectedSeats.length === 0 || actionLoading) && styles.bookBtnDisabled]}
            onPress={handleBook}
            disabled={selectedSeats.length === 0 || actionLoading}
          >
            <Text style={styles.bookBtnText}>
              {actionLoading ? 'Booking...' : `Pay ₹${totalPrice} & Confirm`}
            </Text>
          </TouchableOpacity>
        )}
        {step === 'reserved' && (
          <Text style={styles.reserveNote}>Complete payment within 10 minutes.</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#8b8b9e', marginTop: 12 },
  backLink: { marginBottom: 8 },
  backLinkText: { color: '#e50914', fontSize: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#f8f8fc', marginBottom: 4 },
  meta: { fontSize: 14, color: '#8b8b9e', marginBottom: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  screenArea: { alignItems: 'center', marginBottom: 16 },
  screenCurve: {
    width: '80%',
    height: 8,
    backgroundColor: '#252532',
    borderRadius: 4,
    marginBottom: 4,
  },
  screenLabel: { fontSize: 10, color: '#5c5c6d', letterSpacing: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 16 },
  legendDot: { width: 16, height: 16, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#8b8b9e' },
  available: { backgroundColor: '#1a1a24', borderWidth: 1, borderColor: '#252532' },
  selected: { backgroundColor: '#e50914' },
  reserved: { backgroundColor: 'rgba(245,158,11,0.4)', borderWidth: 1, borderColor: '#f59e0b' },
  booked: { backgroundColor: '#374151' },
  seatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowLetter: { width: 20, fontWeight: '600', color: '#8b8b9e', textAlign: 'center' },
  rowSeats: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  seatWrapper: { flexDirection: 'row', alignItems: 'center' },
  aisleGap: { width: 12 },
  seat: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatAvailable: { backgroundColor: '#1a1a24', borderWidth: 1, borderColor: '#252532' },
  seatSelected: { backgroundColor: '#e50914' },
  seatReserved: { backgroundColor: 'rgba(245,158,11,0.25)', borderWidth: 1, borderColor: '#f59e0b' },
  seatBooked: { backgroundColor: '#374151' },
  seatText: { fontSize: 11, fontWeight: '600', color: '#f8f8fc' },
  seatTextMuted: { color: '#6b7280' },
  errorBanner: { color: '#ef4444', fontSize: 14, marginTop: 8 },
  footer: {
    backgroundColor: '#12121a',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#252532',
  },
  summary: { marginBottom: 8 },
  summaryLabel: { fontSize: 12, color: '#8b8b9e' },
  summaryValue: { fontSize: 16, fontWeight: '500', color: '#f8f8fc' },
  summaryPrice: { fontSize: 18, fontWeight: '700', color: '#e50914' },
  bookBtn: {
    backgroundColor: '#e50914',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  bookBtnDisabled: { opacity: 0.5 },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  reserveNote: { fontSize: 12, color: '#8b8b9e', textAlign: 'center', marginTop: 8 },
  errorText: { color: '#e50914', marginBottom: 16 },
  backBtn: { backgroundColor: '#e50914', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '600' },
})
