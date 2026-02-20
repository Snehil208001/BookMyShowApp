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
import { signup, login } from '../api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../context/AuthContext'

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await signup({ name, email, password })
      const { data } = await login({ email, password })
      if (data.token) {
        await AsyncStorage.setItem('token', data.token)
      }
      setUser(data.user)
      navigation.replace('Home')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
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
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#5c5c6d"
          value={name}
          onChangeText={setName}
        />
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
            <Text style={styles.btnText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text style={styles.footerLink}>Login</Text>
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
