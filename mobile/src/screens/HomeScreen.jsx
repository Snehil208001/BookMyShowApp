import { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { getMovies } from '../api'
import { API_BASE } from '../config'

function MovieCard({ movie, onPress }) {
  const [imgError, setImgError] = useState(false)
  const poster = movie.poster && !imgError ? { uri: movie.poster } : null

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(movie)} activeOpacity={0.8}>
      <View style={styles.posterContainer}>
        {poster ? (
          <Image source={poster} style={styles.poster} onError={() => setImgError(true)} />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterEmoji}>🎬</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{movie.title}</Text>
        <Text style={styles.duration}>{movie.duration}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen({ navigation }) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')

  const loadMovies = async (reset = false, searchTerm = '') => {
    try {
      if (reset) setRefreshing(true)
      else setLoading(true)
      setError(null)
      const off = reset ? 0 : offset
      const { data } = await getMovies({ limit: 12, offset: off, name: searchTerm || undefined })
      setMovies(reset ? (data.movies || []) : (prev) => [...prev, ...(data.movies || [])])
      setOffset(off + (data.movies?.length || 0))
      setHasMore(data.next_offset !== -1)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load movies. Is the backend running?')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMovies(true, search)
  }, [])

  const onRefresh = () => loadMovies(true, search)

  if (error && movies.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.hint}>Backend: {API_BASE}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadMovies(true)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Book Your Movie</Text>
        <Text style={styles.heroSubtitle}>Discover and book tickets</Text>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies..."
          placeholderTextColor="#8b8b9e"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => loadMovies(true, search)}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => loadMovies(true, search)}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Now Showing</Text>
      {loading && movies.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e50914" />
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.ID ?? item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={(m) => navigation.navigate('MovieDetail', { movieId: m.ID ?? m.id })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e50914" />
          }
          ListFooterComponent={
            hasMore && movies.length > 0 ? (
              <TouchableOpacity
                style={styles.loadMore}
                onPress={() => loadMovies(false, search)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#e50914" />
                ) : (
                  <Text style={styles.loadMoreText}>Load More</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.empty}>No movies found</Text>
            ) : null
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', paddingHorizontal: 16 },
  hero: { paddingVertical: 24, paddingTop: 8 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: '#f8f8fc' },
  heroSubtitle: { fontSize: 16, color: '#8b8b9e', marginTop: 4 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  searchInput: {
    flex: 1,
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 14,
    color: '#f8f8fc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#252532',
  },
  searchBtn: {
    backgroundColor: '#e50914',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#f8f8fc', marginBottom: 16 },
  row: { gap: 12, marginBottom: 12 },
  list: { paddingBottom: 24 },
  card: {
    flex: 1,
    backgroundColor: '#12121a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252532',
  },
  posterContainer: { aspectRatio: 2 / 3 },
  poster: { width: '100%', height: '100%' },
  posterPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterEmoji: { fontSize: 48 },
  cardInfo: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#f8f8fc', marginBottom: 4 },
  duration: { fontSize: 12, color: '#8b8b9e' },
  loadMore: { padding: 20, alignItems: 'center' },
  loadMoreText: { color: '#e50914', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#8b8b9e', padding: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#e50914', textAlign: 'center', marginBottom: 8 },
  hint: { color: '#8b8b9e', fontSize: 12, marginBottom: 16 },
  retryBtn: { backgroundColor: '#e50914', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
})
