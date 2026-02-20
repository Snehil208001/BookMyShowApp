import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function BookingSuccessScreen({ route, navigation }) {
  const { movieName = 'Movie', venueName = '', showtime = '', seats = [], total = 0 } = route.params || {}

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>✓</Text>
      </View>
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>Your tickets have been booked successfully.</Text>
      <View style={styles.details}>
        <Text style={styles.detailText}><Text style={styles.bold}>{movieName}</Text></Text>
        {venueName ? <Text style={styles.detailText}>{venueName}</Text> : null}
        {showtime ? <Text style={styles.detailText}>Showtime: {showtime}</Text> : null}
        {seats.length > 0 ? <Text style={styles.detailText}>Seats: {seats.join(', ')}</Text> : null}
        <Text style={styles.total}>Total: ₹{total}</Text>
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Orders')}>
        <Text style={styles.btnText}>View My Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.btnSecondaryText}>Browse More Movies</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', padding: 24, alignItems: 'center', justifyContent: 'center' },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: '700', color: '#f8f8fc', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#8b8b9e', marginBottom: 24 },
  details: {
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#252532',
  },
  detailText: { color: '#f8f8fc', marginBottom: 6 },
  bold: { fontWeight: '600' },
  total: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#252532', fontSize: 18, color: '#e50914', fontWeight: '700' },
  btnPrimary: {
    backgroundColor: '#e50914',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  btnSecondary: {
    backgroundColor: '#12121a',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252532',
  },
  btnSecondaryText: { color: '#f8f8fc', fontWeight: '500' },
})
