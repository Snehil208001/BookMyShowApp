import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { getMovie, getVenuesByMovie } from '../api'

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params
  const [movie, setMovie] = useState(null)
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [posterError, setPosterError] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [movieRes, venuesRes] = await Promise.all([
          getMovie(movieId),
          getVenuesByMovie(movieId),
        ])
        setMovie(movieRes.data.movie || null)
        setVenues(venuesRes.data.venues || [])
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [movieId])

  const handleSelectShowtime = (showtimeId) => {
    navigation.navigate('SeatSelection', { showtimeId })
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }
  if (venues.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No showtimes available</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const poster = movie?.poster && !posterError ? { uri: movie.poster } : null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
        <Text style={styles.backLinkText}>← Back to movies</Text>
      </TouchableOpacity>
      {movie && (
        <View style={styles.header}>
          <View style={styles.posterContainer}>
            {poster ? (
              <Image source={poster} style={styles.poster} onError={() => setPosterError(true)} />
            ) : (
              <View style={styles.posterPlaceholder}>
                <Text style={styles.posterEmoji}>🎬</Text>
              </View>
            )}
          </View>
          <View style={styles.meta}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.duration}>{movie.duration}</Text>
            {movie.desc ? <Text style={styles.desc}>{movie.desc}</Text> : null}
          </View>
        </View>
      )}
      <Text style={styles.sectionTitle}>Select Venue & Showtime</Text>
      {venues.map((venue) => (
        <View key={venue.id} style={styles.venueCard}>
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{venue.name}</Text>
            <Text style={styles.venueLocation}>{venue.location}</Text>
            <Text style={styles.movieName}>{venue.movie_name}</Text>
          </View>
          <View style={styles.showtimes}>
            {venue.show_times?.map((st) => (
              <TouchableOpacity
                key={st.id}
                style={styles.showtimeBtn}
                onPress={() => handleSelectShowtime(st.id)}
              >
                <Text style={styles.showtimeText}>{typeof st === 'string' ? st : st.timing}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backLink: { marginBottom: 16 },
  backLinkText: { color: '#e50914', fontWeight: '500' },
  header: { flexDirection: 'row', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#252532' },
  posterContainer: { width: 120, aspectRatio: 2 / 3, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1a1a24' },
  poster: { width: '100%', height: '100%' },
  posterPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  posterEmoji: { fontSize: 40 },
  meta: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#f8f8fc', marginBottom: 4 },
  duration: { color: '#8b8b9e', marginBottom: 8 },
  desc: { fontSize: 14, color: '#8b8b9e', lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#f8f8fc', marginBottom: 16 },
  venueCard: {
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252532',
  },
  venueInfo: { marginBottom: 12 },
  venueName: { fontSize: 16, fontWeight: '600', color: '#f8f8fc', marginBottom: 4 },
  venueLocation: { fontSize: 14, color: '#8b8b9e', marginBottom: 4 },
  movieName: { fontSize: 13, color: '#e50914' },
  showtimes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  showtimeBtn: {
    backgroundColor: '#1a1a24',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  showtimeText: { color: '#f8f8fc', fontWeight: '500' },
  errorText: { color: '#e50914', marginBottom: 16 },
  empty: { color: '#8b8b9e', marginBottom: 16 },
  backBtn: { backgroundColor: '#e50914', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '600' },
})
