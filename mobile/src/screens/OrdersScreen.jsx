import { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { getOrders } from '../api'
import { useAuth } from '../context/AuthContext'

export default function OrdersScreen({ navigation }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) loadOrders()
    else setLoading(false)
  }, [user])

  const loadOrders = async () => {
    try {
      const { data } = await getOrders()
      setOrders(data.orders || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.authText}>Please log in to view your orders.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e50914" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      {orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>No bookings yet.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.link}>Browse movies</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={styles.orderPrice}>₹{item.total_price}</Text>
              </View>
              {item.movie_name ? (
                <View style={styles.meta}>
                  <Text style={styles.movieName}>{item.movie_name}</Text>
                  {item.venue_name ? <Text style={styles.venue}>{item.venue_name}</Text> : null}
                  {item.showtime ? <Text style={styles.showtime}>Show: {item.showtime}</Text> : null}
                </View>
              ) : null}
              <Text style={styles.seats}>Seats: {item.seats?.join(', ') || 'N/A'}</Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#f8f8fc', marginBottom: 20 },
  list: { paddingBottom: 24 },
  card: {
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252532',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '600', color: '#f8f8fc' },
  orderPrice: { fontSize: 16, fontWeight: '700', color: '#e50914' },
  meta: { marginBottom: 6 },
  movieName: { fontSize: 14, fontWeight: '500', color: '#f8f8fc' },
  venue: { fontSize: 13, color: '#8b8b9e' },
  showtime: { fontSize: 13, color: '#8b8b9e' },
  seats: { fontSize: 14, color: '#8b8b9e' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authText: { color: '#8b8b9e', marginBottom: 16 },
  btn: { backgroundColor: '#e50914', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  errorText: { color: '#e50914' },
  empty: { color: '#8b8b9e', marginBottom: 12 },
  link: { color: '#e50914', fontWeight: '500' },
})
