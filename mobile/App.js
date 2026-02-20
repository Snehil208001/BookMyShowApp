import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import HeaderRight from './src/components/HeaderRight'
import HomeScreen from './src/screens/HomeScreen'
import MovieDetailScreen from './src/screens/MovieDetailScreen'
import SeatSelectionScreen from './src/screens/SeatSelectionScreen'
import BookingSuccessScreen from './src/screens/BookingSuccessScreen'
import LoginScreen from './src/screens/LoginScreen'
import SignupScreen from './src/screens/SignupScreen'
import OrdersScreen from './src/screens/OrdersScreen'

const Stack = createStackNavigator()

function AppNavigator() {
  const { loading } = useAuth()

  if (loading) {
    return null
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#12121a' },
        headerTintColor: '#f8f8fc',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#0a0a0f' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'BookMyShow',
          headerRight: () => <HeaderRight navigation={navigation} />,
        })}
      />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ title: 'Movie' }} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} options={{ title: 'Select Seats' }} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="light" />
    </AuthProvider>
  )
}
