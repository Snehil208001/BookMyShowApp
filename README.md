# BookMyShow App

A full-stack movie ticket booking platform with **Backend** (Go/Gin), **Web Frontend** (React), **Admin Panel** (React), and **Mobile App** (React Native/Expo). Users can browse movies, select seats, and book tickets across web and mobile.

---

## Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Backend](#backend)
- [Frontend](#frontend)
- [App Flow](#app-flow)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Documentation](#documentation)

---

## Architecture Overview

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Frontend     │  │  Admin Panel    │  │   Mobile App    │
│  React + Vite  │  │  React + Vite   │  │ React Native   │
│   (User App)   │  │  (Admin Only)   │  │    + Expo       │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         │  HTTP/REST         │  HTTP/REST         │  HTTP/REST
         │  (Cookies)         │  (Cookies)         │  (Bearer Token)
         └────────────────────┴────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │     Backend       │
                    │   Go + Gin API    │
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌──────────┐        ┌────────────┐        ┌──────────┐
   │PostgreSQL│        │   AWS S3   │        │ Twilio   │
   │  (GORM)  │        │ (Posters)  │        │  (OTP)   │
   └──────────┘        └────────────┘        └──────────┘
```

---

## Features

| Component | Features |
|-----------|----------|
| **Backend** | JWT auth, movie/venue CRUD, seat reservation (10-min window), order management, S3 poster uploads, Twilio OTP |
| **Frontend** | Movie browse & search, venue/showtime selection, seat selection, booking flow, order history |
| **Admin Panel** | Create movies, upload posters, manage venues, add showtimes (admin-only) |
| **Mobile App** | Same booking flow as web, pull-to-refresh, infinite scroll, token-based auth |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Go 1.22, Gin, GORM, PostgreSQL, JWT, AWS S3, Twilio |
| **Frontend** | React 19, Vite 7, React Router, Axios |
| **Admin** | React 19, Vite 7, React Router, Axios |
| **Mobile** | React Native, Expo 54, React Navigation, AsyncStorage |

---

## Backend

The backend is a REST API built with **Go** and **Gin**. It handles authentication, movie/venue management, seat reservation, and order processing.

### Models (`models/`)

| Model | File | Description |
|-------|------|-------------|
| **User** | `user.go` | ID, Name, Email, Password (bcrypt), PhoneNumber, IsAdmin |
| **Movie** | `movie.go` | ID, Title, Description, Duration, Poster (S3 URL), relations to Venues/ShowTimes |
| **Venue** | `venue.go` | ID, Name, Location, Movies (many-to-many), ShowTimes |
| **ShowTime** | `venue.go` | ID, Timing, MovieID, VenueID, Seats |
| **Seat** | `seat.go` | ID, SeatNumber, IsReserved, IsBooked, IsAvailable, Price, ReservedByUserID, ReservedAt |
| **Order** | `seat.go` | ID, UserID, ShowTimeID, TotalPrice, Seats (many-to-many) |

### Controllers (`controllers/`)

| Controller | Handlers | Description |
|------------|----------|-------------|
| **user.go** | SignUp, Login, GetMe, Logout | Registration, JWT auth, session |
| **movie.go** | GetAllMovies, CreateMovie, GetMovieByID, GetVenuesByMovieID, UploadMoviePoster | Movie CRUD, pagination, search by name |
| **venue.go** | GetAllVenues, CreateVenue, GetVenueByID, AddMoviesInVenue, AddShowTimings | Venue CRUD, showtime management |
| **seat.go** | GetSeatLayout, ReserveSeats, BookSeats | Seat matrix, 10-min reservation, booking |
| **order.go** | GetOrders | User order history |

### Routes (`routes/`)

Routes are grouped by resource: `UserRoutes`, `MovieRoutes`, `VenueRoutes`, `SeatRoutes`, `OrderRoutes`. Protected endpoints use `middleware.RequireAuth`; admin-only endpoints check `user.IsAdmin`.

### Middleware (`middleware/auth.go`)

- Reads JWT from `Authorization` cookie or `Authorization: Bearer <token>` header
- Validates token, loads user from DB, sets `c.Set("user", user)`
- Returns 401 if invalid or missing

### Key Backend Logic

- **Seat reservation:** 10-minute window; reserved seats auto-expire
- **Booking:** Transaction-based; only reserved-by-user seats can be booked
- **CORS:** Configured for frontend dev ports (5173–5182)
- **S3 upload:** Movie posters stored in AWS S3 via `helpers`

---

## Frontend

The user-facing web app is built with **React 19** and **Vite 7**. It provides movie browsing, seat selection, and booking with cookie-based auth.

### Pages (`frontend/src/pages/`)

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Movie grid with search, pagination, load-more; skeleton loading |
| **MovieDetail** | `/movie/:id` | Movie info, poster, venues & showtimes; redirects to login if guest selects showtime |
| **SeatSelection** | `/showtime/:id` | Seat layout (rows A–E), reserve → book flow, price summary |
| **BookingSuccess** | `/booking-success` | E-ticket summary; links to Orders and Home |
| **Login** | `/login` | Email/password form; redirects to `from` after login |
| **Signup** | `/signup` | Registration form |
| **Orders** | `/orders` | User's booking history; requires auth |

### Components (`frontend/src/components/`)

| Component | Description |
|-----------|-------------|
| **Layout** | Header (logo, nav, user menu, logout), main outlet, footer; mobile hamburger menu |

### Context (`frontend/src/context/AuthContext.jsx`)

- **AuthProvider:** Wraps app; on mount calls `getMe()` to restore session
- **useAuth():** Returns `{ user, setUser, loading }`; used for protected UI and redirects

### API Client (`frontend/src/api.js`)

Axios instance with `baseURL: /api` (dev proxy → backend), `withCredentials: true` for cookies.

| Category | Functions |
|----------|-----------|
| Movies | `getMovies`, `getMovie`, `getVenuesByMovie` |
| Seats | `getSeatLayout`, `reserveSeats`, `bookSeats` |
| Auth | `signup`, `login`, `getMe`, `logout` |
| Orders | `getOrders` |

### Routing (`frontend/src/App.jsx`)

All routes nested under `<Layout />`. Auth-protected pages (SeatSelection, Orders) redirect to `/login` with `state.from` for post-login redirect.

### Frontend Flow

1. **Home** → `getMovies()` → display cards → click → **MovieDetail**
2. **MovieDetail** → `getMovie()`, `getVenuesByMovie()` → select showtime → **SeatSelection** (or `/login` if guest)
3. **SeatSelection** → `getSeatLayout()` → select seats → `reserveSeats()` → `bookSeats()` → **BookingSuccess**
4. **Orders** → `getOrders()` → display order cards

---

## App Flow

### 1. User Authentication Flow

```
Signup/Login → Backend validates → JWT issued
     ↓
Frontend: Cookie stored (httpOnly)
Mobile: Token in AsyncStorage
     ↓
All protected requests include token
     ↓
Middleware validates → User in context
```

### 2. Ticket Booking Flow

```
Browse Movies (GET /movies/)
     ↓
Select Movie → View Venues & Showtimes (GET /movies/venues/:id)
     ↓
Select Showtime → View Seat Layout (GET /seats/showtime/:id)
     ↓
Select Seats → Reserve (POST /seats/showtime/reserve) [10 min window]
     ↓
Confirm → Book (POST /seats/showtime/book)
     ↓
Order Created → Success Page
     ↓
View Orders (GET /orders/)
```

### 3. Admin Flow

```
Admin Login (isAdmin: true required)
     ↓
Create Movie (POST /movies/)
     ↓
Upload Poster (POST /movies/upload/poster/:id) → S3
     ↓
Create Venue (POST /venues/)
     ↓
Add Movies to Venue (POST /venues/:id/movies/add)
     ↓
Add Showtimes (POST /venues/:id/timings/add)
     ↓
Backend auto-generates seats for each showtime
```

---

## Quick Start

### Prerequisites

- Go 1.22+
- Node.js 18+
- PostgreSQL 15+ (or Docker)
- (Mobile) Node.js, Expo CLI, Android Studio / Xcode

### 1. Clone & Backend Setup

```bash
git clone https://github.com/Snehil208001/BookMyShowApp.git
cd BookMyShowApp
```

```bash
cp .env.example .env
# Edit .env with DB_URL, SECRET, AWS_*, TWILIO_*
```

**Database (choose one):**

```bash
# Option A: Docker
docker-compose up -d

# Option B: Local PostgreSQL
psql -U postgres -c "CREATE DATABASE bookmyshow;"
```

**Start Backend:**

```bash
go run .
# Server: http://localhost:8080
```

### 2. Frontend (User Web App)

```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173 (proxies /api to backend)
```

### 3. Admin Panel

Create an admin user first (from project root):

```bash
go run ./cmd/create-admin
# Default: snehil123@gmail.com / 123456
```

Then start the admin panel:

```bash
cd frontend-admin
npm install
npm run dev
# Admin: http://localhost:5176
```

### 4. Mobile App

```bash
cd mobile
npm install
```

Edit `mobile/src/config.js` – set `YOUR_IP` to your computer's IP (for physical device on same WiFi).

```bash
# Android emulator: set ANDROID_EMULATOR = true in config.js
npm run android
# or
npm run ios
```

### Running the Full Stack

| Service | Command | URL |
|---------|---------|-----|
| Backend | `go run .` | http://localhost:8080 |
| Frontend | `cd frontend && npm run dev` | http://localhost:5173 |
| Admin | `cd frontend-admin && npm run dev` | http://localhost:5176 |
| Mobile | `cd mobile && npm run android` | Device/Emulator |

**Tip:** Start backend first, then frontend/admin. For mobile, ensure backend is reachable (same WiFi for physical device).

---

## Project Structure

```
BookMyShowApp/
├── main.go                 # Backend entry point
├── controllers/            # User, Movie, Venue, Seat, Order handlers
├── models/                 # User, Movie, Venue, ShowTime, Seat, Order
├── routes/                 # API route definitions
├── middleware/             # JWT auth middleware
├── initializers/            # DB, env, AWS setup
├── helpers/                # S3 upload, seat generation, OTP
├── cmd/
│   ├── create-admin/       # Create admin user
│   └── seed/              # Seed sample data
├── frontend/               # User web app (React + Vite)
│   └── src/
│       ├── pages/         # Home, MovieDetail, SeatSelection, Orders, Login, Signup
│       ├── context/       # AuthContext
│       └── api.js         # API client
├── frontend-admin/         # Admin panel (React + Vite)
│   └── src/
│       ├── pages/         # Dashboard, Movies, Venues, Login
│       └── api.js
├── mobile/                 # Mobile app (React Native + Expo)
│   └── src/
│       ├── screens/       # Same flow as frontend
│       ├── config.js     # API URL (IP for device)
│       └── api.js
├── docker-compose.yml      # PostgreSQL
└── .env.example
```

---

## API Endpoints

| Resource | Method | Endpoint | Auth |
|----------|--------|----------|------|
| **User** | POST | `/user/signup` | No |
| | POST | `/user/login` | No |
| | GET | `/user/me` | Yes |
| | POST | `/user/logout` | Yes |
| **Movies** | GET | `/movies/` | No |
| | POST | `/movies/` | Admin |
| | GET | `/movies/:id` | No |
| | GET | `/movies/venues/:id` | No |
| | POST | `/movies/upload/poster/:id` | Admin |
| **Venues** | GET | `/venues/` | No |
| | POST | `/venues/` | Admin |
| | GET | `/venues/:id` | No |
| | POST | `/venues/:id/movies/add` | Admin |
| | POST | `/venues/:id/timings/add` | Admin |
| **Seats** | GET | `/seats/showtime/:id` | No |
| | POST | `/seats/showtime/reserve` | Yes |
| | POST | `/seats/showtime/book` | Yes |
| **Orders** | GET | `/orders/` | Yes |

See [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) for request/response examples.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL connection string |
| `SECRET` | JWT secret (min 32 chars) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_SERVICE_SID` | Twilio Verify service SID |
| `AWS_REGION` | AWS region (e.g. ap-south-1) |
| `AWS_ACCESS_KEY` | AWS access key |
| `AWS_SECRET_KEY` | AWS secret key |
| `AWS_BUCKET_NAME` | S3 bucket for posters |

---

## Documentation

- [LOCAL_SETUP.md](LOCAL_SETUP.md) – Local development setup
- [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) – API usage with Postman
- [TESTING.md](TESTING.md) – Testing guide

---

## License

MIT
