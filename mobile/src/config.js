import { Platform } from 'react-native'

// Your computer's IP - required when using physical device on same WiFi
// Find it: ipconfig (Windows) or ifconfig (Mac) - look for IPv4
const YOUR_IP = '192.168.1.8'

// Set to true only if using Android EMULATOR (not physical device)
const ANDROID_EMULATOR = false

const getApiBase = () => {
  if (Platform.OS === 'android' && ANDROID_EMULATOR) {
    return 'http://10.0.2.2:8080'
  }
  if (Platform.OS === 'ios') {
    return 'http://localhost:8080'
  }
  return `http://${YOUR_IP}:8080`
}

export const API_BASE = getApiBase()
