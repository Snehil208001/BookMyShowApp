import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '../context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { logout } from '../api'

export default function HeaderRight({ navigation }) {
  const { user, setUser } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {}
    await AsyncStorage.removeItem('token')
    setUser(null)
    navigation.navigate('Home')
  }

  if (user) {
    return (
      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={styles.btn}>
          <Text style={styles.text}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.btn}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.btn}>
        <Text style={styles.text}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupBtn}>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { padding: 4 },
  text: { color: '#8b8b9e', fontWeight: '500' },
  logout: { color: '#8b8b9e', fontSize: 14 },
  signupBtn: { backgroundColor: '#e50914', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  signupText: { color: '#fff', fontWeight: '600' },
})
