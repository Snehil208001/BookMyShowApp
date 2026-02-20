import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { login } from '../api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await login({ email, password })
      if (data.token) {
        await AsyncStorage.setItem('token', data.token)
      }
      setUser(data.user)
      const from = route.params?.from
      const showtimeId = route.params?.showtimeId
      if (from === 'SeatSelection' && showtimeId) {
        navigation.replace('SeatSelection', { showtimeId })
      } else {
        navigation.replace('Home')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#5c5c6d"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#5c5c6d"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text style={styles.footerLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#252532',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#f8f8fc', textAlign: 'center', marginBottom: 24 },
  input: {
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
    padding: 14,
    color: '#f8f8fc',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252532',
  },
  error: { color: '#ef4444', fontSize: 14, marginBottom: 8 },
  btn: {
    backgroundColor: '#e50914',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#8b8b9e' },
  footerLink: { color: '#e50914', fontWeight: '500' },
})
