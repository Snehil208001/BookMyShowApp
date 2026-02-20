# BookMyShow Mobile (React Native / Expo)

Android and iOS app for the BookMyShow movie booking platform.

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- Android Studio (for Android) / Xcode (for iOS, macOS only)
- Backend running at `http://localhost:8080`

## Setup

```bash
cd mobile
npm install
```

## API URL Configuration (IMPORTANT)

Edit `src/config.js` before running:

1. **YOUR_IP** – Set to your computer's IP (run `ipconfig` on Windows, `ifconfig` on Mac)
2. **ANDROID_EMULATOR** – Set to `true` only if using Android emulator (not physical device)

- **Physical device (Expo Go)**: Uses `YOUR_IP` – phone and computer must be on same WiFi
- **Android emulator**: Set `ANDROID_EMULATOR = true` (uses 10.0.2.2)
- **iOS simulator**: Uses localhost automatically

**Backend must be running** before opening the app: `go run .` in project root.

## Run

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

Scan the QR code with Expo Go app for quick testing on a physical device.

## Build for Production

```bash
# Create production build (EAS Build)
npx eas build --platform android
npx eas build --platform ios
```

Or use `expo prebuild` for native projects, then build with Xcode/Android Studio.

## Features

- Browse movies with search
- View movie details and showtimes
- Select seats and book tickets
- User login/signup
- Order history

## Credentials

- User: `test@example.com` / `password123`
